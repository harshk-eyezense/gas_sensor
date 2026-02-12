import React from 'react';
import { FileText, Download, Clock } from 'lucide-react';

const Reports = () => {
  // Placeholder data for recently viewed reports
  const mockReports = [
    { name: 'Firmware Patch Overview', time: '1hr ago' },
    { name: 'Storage Utilization', time: '1hr ago' },
    { name: 'Sensor Performance', time: '12hr ago' },
    { name: 'Deployment Tracker', time: '23hr ago' },
    { name: 'User Activity Snapshot', time: '1d ago' },
    { name: 'System Health', time: '1w ago' },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold text-slate-800">Reports</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Report Generation Panel */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Generate Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Report Type</label>
              <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Select Type</option>
                <option>Firmware Patch Overview</option>
                <option>Sensor Performance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sensors</label>
              <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Select Sensor(s)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Time Period</label>
              <input type="date" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200">
              Generate
            </button>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 text-slate-700">Recently Viewed Reports</h3>
            <div className="space-y-2">
              {mockReports.map((report, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <span className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{report.name}</span>
                  </span>
                  <span className="flex items-center space-x-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>{report.time}</span>
                  </span>
                  {/* Placeholder for Download button from Figma */}
                  <button className="p-1 rounded-full text-gray-400 hover:bg-gray-200">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Beta Version Panel */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-6 rounded-xl shadow-lg">
          <div className="text-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 lucide lucide-lock-keyhole-open"><rect width="18" height="12" x="3" y="10" rx="2"/><path d="M18 10V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"/><path d="M10 20v-5"/><path d="M12 15v5"/></svg>
            <h2 className="text-xl font-bold">Beta Version</h2>
            <p>Coming Soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
