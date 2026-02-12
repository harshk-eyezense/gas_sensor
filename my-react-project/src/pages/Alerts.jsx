import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data to simulate alerts with severity from 1 to 5
  const mockAlerts = [
    { name: 'Sensor 1', type: 'Chemical', time: '5 Jun 2023 13:30', status: 'Resolved', severity: 1 },
    { name: 'Sensor 2', type: 'Audio', time: '5 Jun 2023 11:46', status: 'Active', severity: 5 },
    { name: 'Sensor 3', type: 'Drone', time: '4 Jun 2023 21:34', status: 'Resolved', severity: 2 },
    { name: 'Sensor 4', type: 'Robot', time: '4 Jun 2023 1:20', status: 'Active', severity: 4 },
    { name: 'Sensor 5', type: 'Drone', time: '3 Jun 2023 23:10', status: 'Resolved', severity: 1 },
    { name: 'Sensor 6', type: 'Video', time: '2 Jun 2023 17:10', status: 'Active', severity: 5 },
    { name: 'Sensor 7', type: 'Chemical', time: '1 Jun 2023 7:28', status: 'Resolved', severity: 3 },
  ];
  
  // Use a color map for the severity scale
  const severityColorMap = ['#d32f2f', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50']; // Red -> Orange -> Yellow -> Light Green -> Green

  useEffect(() => {
    // For now, we will use mock data directly for the purpose of this example.
    // In a real application, you would replace this with a fetch call to your backend.
    setAlerts(mockAlerts);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading alerts...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Alerts</h1>
        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Alert Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Sensor Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Sensor Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    <span className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full`} style={{backgroundColor: i < alert.severity ? severityColorMap[alert.severity -1] : '#e2e8f0'}}></div>
                      ))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{alert.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{alert.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{alert.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
