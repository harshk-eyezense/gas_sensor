// import React, { useState, useEffect } from 'react';
// import ApexCharts from 'react-apexcharts';
// import { BarChart2 } from 'lucide-react';

// const Dashboard = () => {
//   const [sensorStatus, setSensorStatus] = useState([]);
//   const [recentAlerts, setRecentAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [gasChartData, setGasChartData] = useState([]);

//   // WebSocket logic for real-time gas data
//   useEffect(() => {
//     // This connects to the mock stream on component mount
//     const ws = new WebSocket('ws://127.0.0.1:8000/ws/mock_stream?sensor_id=mock_sensor_01&gas_type=CO2&interval_ms=1000');
    
//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       if (message.type === 'mock_data') {
//         const reading = message.data;
//         setGasChartData(prevData => {
//           const newData = [...prevData, { x: new Date(reading.timestamp).getTime(), y: reading.value }];
//           // Keep only the last 50 data points for a "worm chart" effect
//           return newData.slice(-50);
//         });
//       }
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   // API call for static dashboard data
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const sensorStatusResponse = await fetch('http://127.0.0.1:8000/dashboard/sensor_summary');
//         if (!sensorStatusResponse.ok) {
//           throw new Error('Failed to fetch sensor status data');
//         }
//         const sensorStatusData = await sensorStatusResponse.json();
//         setSensorStatus(sensorStatusData.data);
        
//         const alertsResponse = await fetch('http://127.0.0.1:8000/alerts/recent');
//         if (!alertsResponse.ok) {
//           throw new Error('Failed to fetch alerts data');
//         }
//         const alertsData = await alertsResponse.json();
//         setRecentAlerts(alertsData.data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchDashboardData();
//   }, []);

//   const alertCounts = recentAlerts.filter(alert => !alert.resolved).length;

//   // Chart configuration for real-time gas data
//   const gasChartOptions = {
//     chart: {
//       id: 'gas-realtime-chart',
//       toolbar: { show: false },
//       zoom: { enabled: false },
//     },
//     xaxis: {
//       type: 'datetime',
//       range: 50000, // Show a 50-second window
//     },
//     yaxis: {
//       min: 0,
//       max: 100,
//     },
//     stroke: {
//       curve: 'smooth',
//       width: 2,
//     },
//     colors: ['#ef4444'], // A nice red color
//     tooltip: {
//       x: { format: 'HH:mm:ss' },
//     },
//   };
  
//   const gasChartSeries = [{ name: 'Gas Value', data: gasChartData }];

//   if (loading) {
//     return <div className="p-8 text-center text-slate-500">Loading dashboard data...</div>;
//   }
  
//   if (error) {
//     return <div className="p-8 text-center text-red-500">Error: {error}</div>;
//   }

//   return (
//     <div className="p-8 space-y-8">
//       <h1 className="text-3xl font-semibold text-slate-800">Sensors Fusion Dashboard</h1>
//       <div className="bg-white p-6 rounded-xl shadow-lg">
//         <h2 className="text-xl font-semibold mb-4 text-slate-700">Sensor Status</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {sensorStatus.map((sensor) => (
//             <div key={sensor.type} className="p-4 rounded-lg bg-gray-100 border border-gray-200">
//               <h3 className="text-lg font-medium text-slate-700 mb-2">{sensor.type}</h3>
//               <p className="text-sm text-green-600 font-bold">Active: {sensor.active}</p>
//               <p className="text-sm text-yellow-600 font-bold">At-Risk: {sensor.atRisk}</p>
//               <p className="text-sm text-red-600 font-bold">Offline: {sensor.offline}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-xl shadow-lg">
//           <h2 className="text-xl font-semibold mb-4 text-slate-700">Recent Alerts</h2>
//           <div className="flex justify-between items-center mb-4">
//             <span className="text-sm text-slate-500">Number of Alerts Unresolved = <span className="font-bold text-red-600">{alertCounts}</span></span>
//             <span className="text-sm text-blue-500 font-medium cursor-pointer">Filter</span>
//           </div>
//           <div className="space-y-4">
//             {recentAlerts.map((alert, index) => (
//               <div key={index} className="flex items-center space-x-4 p-3 border-b last:border-b-0 border-gray-200">
//                 <div className={`w-2 h-2 rounded-full ${alert.resolved ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                 <div className="flex-1">
//                   <div className="font-medium text-slate-800">{alert.type} - {alert.name}</div>
//                   <div className="text-sm text-slate-500">{alert.description}</div>
//                 </div>
//                 <div className="text-sm text-slate-400">{alert.time}</div>
//                 <div className="text-sm text-blue-500">{alert.resolved ? 'Resolved' : 'Unresolved'}</div>
//               </div>
//             ))}
//           </div>
//           <div className="text-center mt-4">
//             <a href="#" className="text-sm text-blue-500 font-medium">See more...</a>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
//           <h2 className="text-xl font-semibold mb-4 text-slate-700">Live Gas Sensor Data</h2>
//           <div className="w-full">
//             <ApexCharts options={gasChartOptions} series={gasChartSeries} type="line" height={300} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { BarChart2, FlaskConical, Video, Mic, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [sensorStatus, setSensorStatus] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gasChartData, setGasChartData] = useState([]);

  // WebSocket logic for real-time gas data
  useEffect(() => {
    // This connects to the mock stream on component mount
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/mock_stream?sensor_id=mock_sensor_01&gas_type=CO2&interval_ms=1000');
    //const ws = new WebSocket('wss://tension-raleigh-permission-portable.trycloudflare.com/ws/mock_stream?sensor_id=mock_sensor_01&gas_type=CO2&interval_ms=1000');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'mock_data') {
        const reading = message.data;
        setGasChartData(prevData => {
          const newData = [...prevData, { x: new Date(reading.timestamp).getTime(), y: reading.value }];
          // Keep only the last 50 data points for a "worm chart" effect
          return newData.slice(-50);
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // API call for static dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sensorStatusResponse = await fetch('http://127.0.0.1:8000/dashboard/sensor_summary');
        //const sensorStatusResponse = await fetch('https://tension-raleigh-permission-portable.trycloudflare.com');
        if (!sensorStatusResponse.ok) {
          throw new Error('Failed to fetch sensor status data');
        }
        const sensorStatusData = await sensorStatusResponse.json();
        setSensorStatus(sensorStatusData.data);
        
        const alertsResponse = await fetch('http://127.0.0.1:8000/alerts/recent');
        //const alertsResponse = await fetch('https://tension-raleigh-permission-portable.trycloudflare.com');
        if (!alertsResponse.ok) {
          throw new Error('Failed to fetch alerts data');
        }
        const alertsData = await alertsResponse.json();
        setRecentAlerts(alertsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const alertCounts = recentAlerts.filter(alert => !alert.resolved).length;

  // Chart configuration for real-time gas data
  const gasChartOptions = {
    chart: {
      id: 'gas-realtime-chart',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: {
      type: 'datetime',
      range: 50000, // Show a 50-second window
    },
    yaxis: {
      min: 0,
      max: 100,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#ef4444'], // A nice red color
    tooltip: {
      x: { format: 'HH:mm:ss' },
    },
  };
  
  const gasChartSeries = [{ name: 'Gas Value', data: gasChartData }];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard data...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const getSensorIcon = (type) => {
    switch (type) {
      case 'Chemical Sensors':
        return <FlaskConical className="h-6 w-6 text-white" />;
      case 'Video Sensors':
        return <Video className="h-6 w-6 text-white" />;
      case 'Audio Sensors':
        return <Mic className="h-6 w-6 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Sensors Fusion Dashboard</h1>
      
      {/* Sensor Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sensorStatus.map((sensor) => (
          <div 
            key={sensor.type} 
            className="p-6 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-105
                       bg-gradient-to-br from-blue-500 to-blue-700 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-full">{getSensorIcon(sensor.type)}</div>
              <h3 className="text-xl font-semibold">{sensor.type}</h3>
            </div>
            <div className="grid grid-cols-3 text-center">
              <div>
                <p className="text-lg font-bold text-green-300">{sensor.active}</p>
                <p className="text-sm">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-300">{sensor.atRisk}</p>
                <p className="text-sm">At-Risk</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-300">{sensor.offline}</p>
                <p className="text-sm">Offline</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Alerts and Live Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recent Alerts Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">Recent Alerts</h2>
            <div className="flex items-center space-x-2 text-red-500 font-bold">
              <AlertCircle className="h-5 w-5" />
              <span>{alertCounts} Unresolved</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl transition-colors duration-200 hover:bg-gray-100">
                <div className="flex-shrink-0">
                  {alert.resolved ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{alert.name}</div>
                  <div className="text-sm text-slate-500">{alert.description}</div>
                </div>
                <div className="text-sm text-slate-400 flex-shrink-0">{alert.time}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="#" className="text-blue-500 font-medium flex items-center justify-center space-x-2">
              <span>View all alerts</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        {/* Live Data Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800">Live Gas Sensor Data</h2>
          <div className="w-full h-full flex flex-col justify-between">
            <ApexCharts options={gasChartOptions} series={gasChartSeries} type="line" height={300} />
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center text-slate-500">
              <p className="font-semibold">Inactivity Bar Chart</p>
              <p className="text-sm">This section is for the Sensor Inactivity Bar Chart.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
