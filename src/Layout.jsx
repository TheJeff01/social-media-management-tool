// Layout.jsx - This would contain your shared layout
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CiBellOn } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6";
import Sidebar from "./components/sidebar/Sidebar";

function Layout() {
  const location = useLocation();

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

  return (
    <div className="app-wrapper">
      <div className="layout">
        <Sidebar />
        
        <div className="app-container">
          <div className="app-header">
            <h1>{getPageTitle()}</h1>
            <div className="notification-user">
              <CiBellOn />
              <FaRegCircleUser />
            </div>
          </div>

          {/* This is where your page components will render */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
