import React, { useState } from 'react';
import { Wrench, Upload, RefreshCcw, HardDrive, Zap, Crosshair } from 'lucide-react';

const Maintenance = () => {
  const [activeTab, setActiveTab] = useState('upgrade');

  const tabs = [
    { name: 'Upgrade Devices', key: 'upgrade', icon: Upload },
    { name: 'Factory Reset', key: 'reset', icon: RefreshCcw },
    { name: 'Clear Disk Space', key: 'clear', icon: HardDrive },
    { name: 'Deploy Robots/Drones', key: 'deploy', icon: Zap },
  ];

  // Placeholder data for the tables and forms
  const mockUpgradeData = [
    { timestamp: '5 Jun 2023 13:30', customer: 'Customer X', deviceId: '123456', type: 'Chemical', status: 'Failed' },
    { timestamp: '5 Jun 2023 11:46', customer: 'Customer Y', deviceId: '098765', type: 'Audio', status: 'Retry' },
    { timestamp: '4 Jun 2023 21:34', customer: 'Customer X', deviceId: '542854', type: 'Drone', status: 'Retry' },
  ];

  const mockFactoryResetData = [
    { device: 'Device Z', user: 'User A', progress: 'In Progress' },
    { device: 'Device X', user: 'User D', progress: 'Completed' },
  ];

  const mockClearDiskData = [
    { device: 'Device Z', user: 'User A', cleared: '50GB', total: '100GB' },
    { device: 'Device X', user: 'User D', cleared: '20GB', total: '50GB' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'upgrade':
        return (
          <div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Upgrade Devices</h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Select Device</label>
                    <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Device 1</option>
                      <option>Device 2</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Upload Patch</label>
                    <input type="file" className="mt-1 block w-full text-sm text-gray-500" />
                  </div>
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200">
                    Upload
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Recent Upgrades</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockUpgradeData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.timestamp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.deviceId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'reset':
        return (
          <div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Factory Reset Devices</h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Select Device</label>
                    <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Device 1</option>
                      <option>Device 2</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Type 'Factory Reset' to confirm</label>
                    <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <button className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200">
                    Reset
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Recent Factory Resets</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockFactoryResetData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.device}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.user}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.progress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'clear':
        return (
          <div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Clear Disk Space</h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Select Device</label>
                    <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Device 1</option>
                      <option>Device 2</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700">Type 'Clear' to confirm</label>
                    <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200">
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Recent Cleared Disk Space</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cleared Space</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Space</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockClearDiskData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.device}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.user}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.cleared}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'deploy':
        return (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Deploy Robots/Drones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Select Device</label>
                  <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Device 1</option>
                    <option>Device 2</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Enter Coordinates</label>
                  <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Enter Coordinates" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Payload Configuration</label>
                  <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Select Sensor(s)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">Estimated Duration</label>
                  <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Enter Estimated Duration" />
                </div>
                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200">
                  Deploy
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <h4 className="font-semibold text-slate-700">Cameras</h4>
                <div className="flex items-center justify-between">
                  <span>Camera 1</span>
                  <input type="checkbox" className="form-checkbox text-blue-500 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Camera 2</span>
                  <input type="checkbox" className="form-checkbox text-blue-500 rounded" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold text-slate-800">Maintenance</h1>
      
      {/* Tab navigation */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-wrap gap-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 p-3 rounded-lg font-semibold transition-colors duration-200 ${
              activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
      
      {/* Content based on active tab */}
      {renderContent()}
    </div>
  );
};

export default Maintenance;
