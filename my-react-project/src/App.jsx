import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Sensors from './pages/Sensors';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup'; // Import the Signup page
import { AuthProvider, useAuth } from './context/AuthContext';

const AppWrapper = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { isAuthenticated, user, authPage } = useAuth(); // Destructure authPage

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <MapPage />;
      case 'sensors':
        return <Sensors />;
      case 'alerts':
        return <Alerts />;
      case 'maintenance':
        return <Maintenance />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return <Signup />;
    }
    return <Login />;
  }

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} userRole={user.role} />
      <main className="flex-1 overflow-y-auto">
        <Header userName={user.name} />
        {renderPage()}
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppWrapper />
  </AuthProvider>
);

export default App;