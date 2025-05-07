import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fetchParkingSpot } from './api/parkingAPI';
import { useAuth0 } from '@auth0/auth0-react';

import Dashboard from './pages/Dashboard';
import LiveFeeds from './pages/LiveFeeds';
import Settings from './pages/Settings';
import Login from './pages/Login.jsx';
import './styles/ParkingMap.css';
import Admin from "./pages/Admin.jsx";
import AdminLayoutEditor from './pages/AdminLayoutEditor';
import AdminParkingMapSetter from "./pages/AdminParkingMapSetter.jsx";


function ProtectedRoutes({ element }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

export default function App() {
  const [statuses, setStatuses] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem('darkMode')) || false;
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // fetch statuses periodically
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const data = await fetchParkingSpot();
        if (isMounted) setStatuses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoutes
            element={
              <Dashboard
                statuses={statuses}
                setStatuses={setStatuses}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
              />
            }
          />
        }
      />
      <Route
        path="/live-feeds"
        element={
          <ProtectedRoutes
            element={
              <LiveFeeds
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
              />
            }
          />
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoutes
            element={
              <Settings
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoutes
            element={
              <Admin
                  showSidebar={showSidebar}
                  setShowSidebar={setShowSidebar}
              />
            }
          />
        }
      />
      <Route
        path="/admin/layout-editor"
        element={<ProtectedRoutes element={<AdminLayoutEditor />} />}
      />
      <Route
        path="/admin/parking-map-setter"
        element={<ProtectedRoutes element={<AdminParkingMapSetter />} />}
      />

      {/* Fallback to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
