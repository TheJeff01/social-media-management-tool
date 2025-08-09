import React, { useState } from "react";
import { Link } from 'react-router-dom'
import "./Sidebar.css";
import { CiMenuFries } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { AiOutlineSchedule } from "react-icons/ai";
import { MdOutlineManageAccounts, MdLogout } from "react-icons/md";

const Sidebar = ({ onLogout }) => {
  const [isSideMenuOpen, setMenu] = useState(false);
  
  const navigationItems = [
    { name: "Dashboard", icon: <IoHomeOutline />, link: '/' },
    { name: "Scheduler", icon: <AiOutlineSchedule />, link: '/scheduler' },
    { name: "Accounts", icon: <MdOutlineManageAccounts />, link: '/accounts' },
  ];

  // Function to close mobile menu when link is clicked
  const handleLinkClick = () => {
    setMenu(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
    }
    setMenu(false);
  };

  return (
    <div className="sidebar">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <div>
          {navigationItems.map((item, index) => (
            <div key={index} className="sidebar-item">
              <Link to={item.link} className="links">
                {item.icon} {item.name}
              </Link>
            </div>
          ))}
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <MdLogout />
          Log Out
        </button>
      </div>

      {/* Mobile menu icon */}
      <CiMenuFries onClick={() => setMenu(true)} className="menu-icon" />

      {/* Mobile Sidebar */}
      <div className={`overlay ${isSideMenuOpen ? "overlay-open" : ""}`}>
        <section className="mobile-sidebar">
          {/* Close button & nav links */}
          <div className="sidebar-content">
            <IoClose onClick={() => setMenu(false)} className="close-icon" />
            {navigationItems.map((item, index) => (
              <div key={index} className="sidebar-item">
                <Link 
                  to={item.link} 
                  className="links" 
                  onClick={handleLinkClick}  // Close menu when clicked
                >
                  {item.icon} {item.name}
                </Link>
              </div>
            ))}
          </div>
          <button 
            onClick={handleLogout}
            className="logout-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MdLogout />
            Log Out
          </button>
        </section>
      </div>
    </div>
  );
};

export default Sidebar;