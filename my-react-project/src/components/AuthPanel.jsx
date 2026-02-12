import React from 'react';
import appLogo from '../assets/logo2.png';

const AuthPanel = () => {
  return (
    <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-400 text-white p-8 rounded-l-xl">
      <div className="flex flex-col items-center">
        <img src={appLogo} alt="EyeZense Logo" className="w-24 h-24 mb-2" />
        <span className="text-4xl font-bold">EyeZense</span>
      </div>
    </div>
  );
};

export default AuthPanel;
