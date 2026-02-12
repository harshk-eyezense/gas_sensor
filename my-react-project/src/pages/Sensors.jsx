import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { FlaskConical, Video, Mic } from 'lucide-react';

const Sensors = () => {
    const [activeTab, setActiveTab] = useState('chemical');
    const [sensorsData, setSensorsData] = useState({
        'chemical': [],
        'video': [],
        'acoustic': []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [streamUrl, setStreamUrl] = useState('');
    const [youtubeStatus, setYoutubeStatus] = useState('Click "Load Stream" to view.');
    const [chemicalChartData, setChemicalChartData] = useState([]);
    const [acousticChartData, setAcousticChartData] = useState([]);

    // This useEffect hook fetches all sensor data when the component first mounts.
    useEffect(() => {
      const fetchSensorsData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const [chemicalResponse, acousticResponse, videoResponse] = await Promise.all([
            fetch('http://127.0.0.1:8000/sensors/chemical'),
            fetch('http://127.0.0.1:8000/sensors/acoustic'),
            fetch('http://127.0.0.1:8000/sensors/video')
          ]);

          if (!chemicalResponse.ok || !acousticResponse.ok || !videoResponse.ok) {
            throw new Error('Failed to fetch sensor data');
          }

          const chemicalData = await chemicalResponse.json();
          const acousticData = await acousticResponse.json();
          const videoData = await videoResponse.json();
          
          setSensorsData({
            'chemical': chemicalData.data,
            'acoustic': acousticData.data,
            'video': videoData.data
          });

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchSensorsData();
    }, []);

    // WebSocket logic for real-time data
    useEffect(() => {
      // Connect to the mock streams on component mount
      const wsChemical = new WebSocket('ws://127.0.0.1:8000/ws/mock_stream?sensor_id=mock_sensor_01&gas_type=CO2&interval_ms=1000');
      const wsAcoustic = new WebSocket('ws://127.0.0.1:8000/ws/mock_stream?sensor_id=mock_sensor_02&gas_type=Acoustic&interval_ms=1000');
      //const wsChemical = new WebSocket('wss://https://tension-raleigh-permission-portable.trycloudflare.com//ws/mock_stream?sensor_id=mock_sensor_01&gas_type=CO2&interval_ms=1000');
      //const wsAcoustic = new WebSocket('wss://https://tension-raleigh-permission-portable.trycloudflare.com//ws/mock_stream?sensor_id=mock_sensor_02&gas_type=Acoustic&interval_ms=1000');
      
    
      wsChemical.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'mock_data') {
          const reading = message.data;
          if (reading.gas_type === 'CO2') {
            setChemicalChartData(prevData => {
              const newData = [...prevData, { x: new Date(reading.timestamp).getTime(), y: reading.value }];
              return newData.slice(-50);
            });
          }
        }
      };

      wsAcoustic.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'mock_data') {
          const reading = message.data;
          if (reading.gas_type === 'Acoustic') {
            setAcousticChartData(prevData => {
              const newData = [...prevData, { x: new Date(reading.timestamp).getTime(), y: reading.value }];
              return newData.slice(-50);
            });
          }
        }
      };

      return () => {
        wsChemical.close();
        wsAcoustic.close();
      };
    }, []);

    
    // Function to handle fetching and setting the YouTube live stream
    const loadYouTubeStream = async () => {
        setYoutubeStatus('Loading stream info...');
        setStreamUrl('');

        try {
            // Find the active video sensor to get its channel handle
            const activeVideoSensor = sensorsData['video'].find(sensor => sensor.status === 'Active');
            if (!activeVideoSensor || !activeVideoSensor.channel) {
                setYoutubeStatus('No active video sensor found or channel is missing.');
                return;
            }

            const channelHandle = activeVideoSensor.channel;

            const response = await fetch(`http://127.0.0.1:8000/youtube/get_live_streams?device_id=5&channel=${encodeURIComponent(channelHandle)}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status && data.data && data.data.length > 0) {
                const targetStream = data.data.find(d => d.channel.toLowerCase() === channelHandle.toLowerCase());

                if (targetStream && targetStream.streamingURL) {
                    setStreamUrl(`https://www.youtube.com/embed/${targetStream.streamingURL}?autoplay=1&mute=1`);
                    setYoutubeStatus(`Live stream loaded for channel: ${channelHandle}`);
                } else {
                    setYoutubeStatus('No live stream found for this channel currently.');
                }
            } else {
                setYoutubeStatus('Failed to retrieve stream information from API.');
            }
        } catch (error) {
            setYoutubeStatus(`Error loading YouTube stream: ${error.message}`);
        }
    };


    const tabs = [
        { name: 'Video Sensors', key: 'video', icon: Video },
        { name: 'Chemical Sensors', key: 'chemical', icon: FlaskConical },
        { name: 'Acoustic Sensors', key: 'acoustic', icon: Mic },
    ];

    // Chart configuration for real-time data
    const chartOptions = (title, yAxisMax) => ({
      chart: {
        id: title,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      xaxis: {
        type: 'datetime',
        range: 50000,
        labels: {
          datetimeFormatter: {
            year: 'yyyy', month: 'MMM', day: 'dd', hour: 'HH:mm', min: 'HH:mm', sec: 'HH:mm:ss'
          }
        }
      },
      yaxis: {
        min: 0,
        max: yAxisMax,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      colors: ['#ef4444'],
      tooltip: {
        x: { format: 'HH:mm:ss' },
      },
    });

    if (loading) {
      return <div className="p-8 text-center text-slate-500">Loading sensors...</div>;
    }

    if (error) {
      return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    // This section renders the Video Sensors content, including the YouTube iframe
    const renderVideoTabContent = () => (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Video Stream</h3>
                <div className="youtube-embed-container mb-4">
                    {streamUrl ? (
                        <iframe
                            src={streamUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <p className="text-gray-500 text-center p-4">{youtubeStatus}</p>
                    )}
                </div>
                <div className="flex justify-center">
                    <button 
                        onClick={loadYouTubeStream}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
                    >
                        Load Stream
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Video Sensors</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sensor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stream</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sensorsData['video'].map((sensor, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sensor.name}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${sensor.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{sensor.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sensor.stream}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sensor.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // This section renders the generic sensor list for Chemical and Acoustic tabs
    const renderGenericTabContent = () => (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-700">Live {activeTab} Data</h3>
              <div className="w-full">
                <ApexCharts 
                  options={chartOptions(`live-${activeTab}-chart`, 100)} 
                  series={[{ name: `${activeTab} Value`, data: activeTab === 'chemical' ? chemicalChartData : acousticChartData }]} 
                  type="line" 
                  height={300} 
                />
              </div>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">{activeTab} Sensors</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sensor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stream</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sensorsData[activeTab].map((sensor, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sensor.name}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${sensor.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{sensor.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sensor.stream}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sensor.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-semibold text-slate-800">Sensors</h1>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex border-b border-gray-200 mb-6">
                    {tabs.map(tab => (
                        <div
                            key={tab.key}
                            className={`flex items-center space-x-2 p-3 cursor-pointer text-slate-600 font-medium ${
                                activeTab === tab.key ? 'border-b-2 border-blue-500 text-blue-500' : ''
                            }`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span>{tab.name}</span>
                        </div>
                    ))}
                </div>
                {activeTab === 'video' ? renderVideoTabContent() : renderGenericTabContent()}
            </div>
        </div>
    );
};

export default Sensors;
