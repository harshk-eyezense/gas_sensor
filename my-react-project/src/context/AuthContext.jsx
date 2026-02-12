import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user object and role
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState('login'); // New state for 'login' or 'signup'

  const login = (username, password) => {
    // Mock login logic based on Figma roles
    if (username === 'admin' && password === 'password') {
      setUser({ name: 'Admin User', role: 'admin' });
      setIsAuthenticated(true);
      setAuthPage('login'); // Reset auth page to login after successful auth
      return true;
    }
    if (username === 'monitor' && password === 'password') {
      setUser({ name: 'Monitor User', role: 'monitor' });
      setIsAuthenticated(true);
      setAuthPage('login');
      return true;
    }
    if (username === 'customer' && password === 'password') {
      setUser({ name: 'Customer User', role: 'customer' });
      setIsAuthenticated(true);
      setAuthPage('login');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthPage('login'); // Reset to login page on logout
  };

  const switchToSignup = () => {
    setAuthPage('signup');
  };

  const switchToLogin = () => {
    setAuthPage('login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, authPage, switchToSignup, switchToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);
