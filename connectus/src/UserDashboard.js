import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  // Track communityId in state to update UI immediately after joining
  const [hasCommunity, setHasCommunity] = useState(!!localStorage.getItem('communityId'));

  useEffect(() => {
    // Listen for changes to communityId in localStorage (e.g., after joining)
    const checkCommunity = () => {
      setHasCommunity(!!localStorage.getItem('communityId'));
    };
    window.addEventListener('storage', checkCommunity);
    // Also check on mount in case it changed in this tab
    const interval = setInterval(checkCommunity, 500);
    return () => {
      window.removeEventListener('storage', checkCommunity);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="dashboard-container card">
      <h1 className="dashboard-title">User Dashboard</h1>
      {!hasCommunity && (
        <button className="dashboard-btn" onClick={() => navigate('/join-community')}>Join Community</button>
      )}
      <button className="dashboard-btn" onClick={() => navigate('/marketplace')}>Marketplace</button>
      <button className="dashboard-btn" onClick={() => navigate('/sos')}>SOS</button>
      <button className="dashboard-btn" onClick={() => navigate('/chat')}>Chat</button>
      <button className="dashboard-btn" onClick={() => navigate('/event-calendar')}>Event Calendar</button>
    </div>
  );
};

export default UserDashboard;
