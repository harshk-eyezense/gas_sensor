import React from 'react';
import { Home, Map, Radar, Bell, Wrench, FileText, Settings } from 'lucide-react';
import appLogo from '../assets/logo.png'; // Import the logo image

const Sidebar = ({ activePage, setActivePage, userRole }) => {
  const sidebarItems = [
    { name: 'Home', icon: Home, page: 'dashboard', roles: ['customer', 'monitor', 'admin'] },
    { name: 'Map', icon: Map, page: 'map', roles: ['customer', 'monitor', 'admin'] },
    { name: 'Sensors', icon: Radar, page: 'sensors', roles: ['customer', 'monitor', 'admin'] },
    { name: 'Alerts', icon: Bell, page: 'alerts', roles: ['customer', 'monitor', 'admin'] },
    { name: 'Maintenance', icon: Wrench, page: 'maintenance', roles: ['monitor', 'admin'] },
    { name: 'Reports', icon: FileText, page: 'reports', roles: ['customer', 'monitor', 'admin'] },
    { name: 'Settings', icon: Settings, page: 'settings', roles: ['customer', 'monitor', 'admin'] },
  ];

  const handleItemClick = (page) => {
    setActivePage(page);
  };

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-300 p-6 min-h-screen">
      <div 
        className="flex items-center space-x-2 mb-8 cursor-pointer"
        onClick={() => setActivePage('dashboard')}
      >
        <img src={appLogo} alt="EyeZense Logo" className="w-8 h-8 rounded-full bg-blue-500" />
        <span className="text-xl font-semibold">EyeZense</span>
      </div>
      <nav className="flex-1">
        <ul>
          {sidebarItems
            .filter(item => item.roles.includes(userRole))
            .map((item) => (
              <li
                key={item.name}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer my-2 transition-colors duration-200 ${
                  activePage === item.page ? 'bg-blue-500 text-white' : 'hover:bg-slate-800'
                }`}
                onClick={() => handleItemClick(item.page)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
