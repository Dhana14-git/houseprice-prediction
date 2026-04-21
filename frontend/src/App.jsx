import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProfilePortal from './pages/ProfilePortal'; // Import the Profile Portal

function App() {
  // Theme state: Preserved exact original logic
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper function to check if the user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page: Accessible to everyone */}
        <Route 
          path="/" 
          element={<Home theme={theme} toggleTheme={toggleTheme} />} 
        />

        {/* Auth Page: Login and Registration */}
        <Route 
          path="/auth" 
          element={<Auth theme={theme} toggleTheme={toggleTheme} />} 
        />

        {/* Protected Profile Portal: New primary landing after Auth */}
        <Route 
          path="/profile" 
          element={
            isAuthenticated() ? (
              <ProfilePortal theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />

        {/* Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated() ? (
              <Dashboard theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />

        {/* Catch-all: Redirects any unknown paths to the landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;