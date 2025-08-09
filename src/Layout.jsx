// Layout.jsx - Updated with authentication and user info
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CiBellOn } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import Sidebar from "./components/sidebar/Sidebar";

function Layout({ onLogout }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get user data from session storage
  useEffect(() => {
    const authData = sessionStorage.getItem('userAuth');
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        setUser(parsedAuth.user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/scheduler":
        return "Scheduler";
      case "/accounts":
        return "Accounts";
      default:
        return "Dashboard";
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
    }
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="app-wrapper">
      <div className="layout">
        <Sidebar onLogout={onLogout} />
        
        <div className="app-container">
          <div className="app-header">
            <div>
              <h1>{getPageTitle()}</h1>
              {user && (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '5px'
                }}>
                  Welcome back, {user.name}!
                </p>
              )}
            </div>
            
            <div className="notification-user">
              <div style={{ position: 'relative' }}>
                <CiBellOn />
                {/* Notification badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  fontSize: '10px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}></div>
              </div>
              
              <div 
                className="user-menu-container" 
                style={{ position: 'relative' }}
                onClick={toggleUserMenu}
              >
                <div style={{ 
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <FaRegCircleUser />
                  {user && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '12px',
                      height: '12px',
                      background: 'var(--accent-color)',
                      borderRadius: '50%',
                      border: '2px solid var(--bg-primary)'
                    }}></div>
                  )}
                </div>
                
                {/* User dropdown menu */}
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: '0',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '15px',
                    minWidth: '200px',
                    zIndex: '1000',
                    animation: 'fadeInDown 0.3s ease'
                  }}>
                    {user && (
                      <div style={{ 
                        marginBottom: '15px',
                        paddingBottom: '15px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          marginBottom: '5px'
                        }}>
                          {user.name}
                        </div>
                        <div style={{
                          color: 'var(--text-muted)',
                          fontSize: '14px'
                        }}>
                          {user.email}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.target.style.color = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <MdLogout />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* This is where your page components will render */}
          <Outlet />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;