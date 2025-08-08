// Dashboard.jsx - Simplified (no more layout duplication!)
import React from 'react'
import './Dashboard.css'
import DashboardDataCard from '../../components/dashboardcard/DashboardDataCard';
import PostNow from '../../components/PostNow/PostNow';

function Dashboard() {
  return (
    <>
      {/* Only the dashboard-specific content */}
      <DashboardDataCard />
      {/* Post Now Component */}
      <PostNow />
      
      {/* You can add more dashboard-specific content here */}
      {/* Charts, graphs, recent activity, etc. */}
    </>
  )
}

export default Dashboard;