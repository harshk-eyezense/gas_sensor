import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthPanel from '../../components/AuthPanel';

const Login = () => {
  const { login, switchToSignup } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg">
        <AuthPanel />
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">Welcome!</h1>
          <p className="text-center text-slate-500 mb-6">
            Don't have an account? <a href="#" onClick={switchToSignup} className="text-blue-500 font-medium">Sign up!</a>
          </p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="username">Email address</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label className="block text-slate-700 text-sm font-medium mb-1" htmlFor="password">Password</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <p className="text-right mt-2"><a href="#" className="text-sm text-blue-500 hover:underline">Forgot Password?</a></p>
            </div>
            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
