// App.jsx - Updated with authentication and theme support
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { ConfirmProvider } from "./components/Confirm/ConfirmProvider";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Scheduler from "./pages/scheduler/Scheduler";
import Login from "./pages/Login/Login";
import Accounts from "./pages/Accounts/Accounts";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (authToken && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Verify token with backend (optional - for production)
          // For now, we'll just check if the token exists
          if (authToken && parsedUser) {
            setIsAuthenticated(true);
            setUser(parsedUser);
          } else {
            // Clear invalid data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
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
    setUser(userData);
    setIsAuthenticated(true);
    // Token and user data are already stored in localStorage by Login component
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      // Call logout endpoint to invalidate token on server (optional)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await fetch('http://localhost:3001/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear session data
      sessionStorage.removeItem('selectedPlatforms');
      sessionStorage.removeItem('postContent');
      sessionStorage.removeItem('scheduledDate');
      sessionStorage.removeItem('scheduledTime');
      sessionStorage.removeItem('scheduledPosts');
      
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
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
          
          {/* OAuth callback routes */}
          <Route path="/twitter/callback" element={<Navigate to="/accounts" replace />} />
          <Route path="/linkedin/callback" element={<Navigate to="/accounts" replace />} />
          
          {/* Protected routes that need the layout (sidebar + header) */}
          <Route path="/" element={<ProtectedRoute><Layout onLogout={handleLogout} user={user} /></ProtectedRoute>}>
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
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;