import React, { useState, useEffect } from 'react';
import { ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ userName }) => {
  const { logout } = useAuth();
  const [theme, setTheme] = useState('light'); // New state for theme

  // This useEffect hook applies the theme to the HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="flex justify-between items-center bg-white p-6 shadow-sm border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-slate-800">Welcome, {userName}!</h2>
        <div className="flex items-center space-x-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
                {theme === 'light' ? (
                    <Sun className="h-5 w-5 text-gray-500" />
                ) : (
                    <Moon className="h-5 w-5 text-gray-500" />
                )}
            </button>
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="font-medium text-slate-700">{userName}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
        </div>
    </header>
  );
};

export default Header;
