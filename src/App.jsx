// App.jsx - Updated with authentication and theme support
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Scheduler from "./pages/scheduler/Scheduler";
import Login from "./pages/Login/Login";
import Accounts from "./pages/Accounts/Accounts";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authData = sessionStorage.getItem('userAuth');
      if (authData) {
        try {
          const parsedAuth = JSON.parse(authData);
          // Check if token is still valid (not expired)
          if (parsedAuth.isLoggedIn && parsedAuth.timestamp) {
            const now = Date.now();
            const loginTime = parsedAuth.timestamp;
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
            
            if (now - loginTime < sessionDuration) {
              setIsAuthenticated(true);
            } else {
              // Session expired, clear storage
              sessionStorage.removeItem('userAuth');
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error('Error parsing auth data:', error);
          sessionStorage.removeItem('userAuth');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(0, 198, 255, 0.3)',
              borderTop: '4px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Login handler
  const handleLogin = (userData) => {
    const authData = {
      isLoggedIn: true,
      user: userData,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('userAuth', JSON.stringify(authData));
    setIsAuthenticated(true);
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('userAuth');
    // Also clear other session data if needed
    sessionStorage.removeItem('selectedPlatforms');
    sessionStorage.removeItem('postContent');
    sessionStorage.removeItem('scheduledDate');
    sessionStorage.removeItem('scheduledTime');
    sessionStorage.removeItem('scheduledPosts');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public route - Login page */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Protected routes that need the layout (sidebar + header) */}
          <Route path="/" element={<ProtectedRoute><Layout onLogout={handleLogout} /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="scheduler" element={<Scheduler />} />
            <Route path="accounts" element={<Accounts />} />
          </Route>
          
          {/* Catch all route - redirect to login if not authenticated, dashboard if authenticated */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/" : "/login"} replace />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;