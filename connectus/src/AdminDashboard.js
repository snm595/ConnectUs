import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Only show Create Community if not already in a community
  const hasCommunity = !!localStorage.getItem('communityId');
  return (
    <div className="dashboard-container card">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      {!hasCommunity && (
        <button className="dashboard-btn" onClick={() => navigate('/create-community')}>Create Community</button>
      )}
      <button className="dashboard-btn" onClick={() => navigate('/manage-users')}>Manage Users</button>
    </div>
  );
};

export default AdminDashboard;
