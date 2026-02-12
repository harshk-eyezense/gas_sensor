import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthPanel from '../../components/AuthPanel';

const Signup = () => {
  const { switchToLogin } = useAuth();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg">
        <AuthPanel />
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">Get Started</h1>
          <p className="text-center text-slate-500 mb-6">Create an account to get started</p>
          <form>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="email">Email address</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="email"
                id="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="password">Password</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>
            <div className="mb-6">
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="confirm-password">Confirm Password</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                id="confirm-password"
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
            >
              Sign up
            </button>
          </form>
          <p className="text-center mt-4">
            <a href="#" onClick={switchToLogin} className="text-sm text-blue-500 hover:underline">Already have an account? Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
