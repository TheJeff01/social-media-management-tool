// Layout.jsx - Updated with authentication, user info, and theme toggle
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CiBellOn } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import Sidebar from "./components/sidebar/Sidebar";
import ThemeToggle from "./ThemeToggle";
import { useConfirm } from "./components/Confirm/ConfirmProvider";

function Layout({ onLogout, user }) {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { confirm } = useConfirm();

  // Get user data from localStorage if not passed as prop
  const [currentUser, setCurrentUser] = useState(user);
  
  useEffect(() => {
    if (!user) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

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

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log out',
      message: 'Are you sure you want to log out?',
      confirmText: 'Log out',
      cancelText: 'Cancel',
      tone: 'danger'
    });
    if (ok) onLogout();
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

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    } else if (currentUser.username) {
      return currentUser.username;
    } else if (currentUser.name) {
      return currentUser.name; // Fallback for old data structure
    }
    
    return 'User';
  };

  return (
    <div className="app-wrapper">
      <div className="layout">
        <Sidebar onLogout={onLogout} />
        
        <div className="app-container">
          <div className="app-header">
            <div>
              <h1>{getPageTitle()}</h1>
              {currentUser && (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '5px'
                }}>
                  Welcome back, {getUserDisplayName()}!
                </p>
              )}
            </div>
            
            <div className="notification-user">
              <ThemeToggle />
              
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
                  {currentUser && (
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
                    {currentUser && (
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
                          {currentUser.name}
                        </div>
                        <div style={{
                          color: 'var(--text-muted)',
                          fontSize: '14px'
                        }}>
                          {currentUser.email}
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