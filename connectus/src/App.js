import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import './App.css';
import './index.css';
import './Chat.css';
import './SOSButton.css';
import './BusinessPage.css';
import './HomePage.css';
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import JoinCommunity from "./JoinCommunity";
import CreateCommunity from "./CreateCommunity";
import Chat from './Chat';
import SOSButton from './SOSButton'; // Import the SOSButton component
import ManageUsers from './ManageUsers';
import BusinessPage from './BusinessPage';
import SOS from './SOS';
import EventCalendar from './EventCalendar';
import HomePage from './HomePage';
import UserDashboard from './UserDashboard';

function Navigation({ isAuthenticated, userRole, onLogout }) {
  // Hide Join/Create Community links if already in a community
  const hasCommunity = !!localStorage.getItem('communityId');
  return (
    <nav className="nav-bar">
      <div className="nav-brand">ConnectUs</div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/home" className="nav-link">Home</Link>
            {(userRole === 'resident' || userRole === 'user') && !hasCommunity && (
              <Link to="/join-community" className="nav-link">Join Community</Link>
            )}
            {userRole === 'admin' && !hasCommunity && (
              <Link to="/create-community" className="nav-link">Create Community</Link>
            )}
            {userRole === 'admin' && (
              <Link to="/manage-users" className="nav-link">Manage Users</Link>
            )}
            {userRole !== 'admin' && (
              <Link to="/marketplace" className="nav-link">Marketplace</Link>
            )}
            <button onClick={onLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Persist authentication state in localStorage
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  });
  const [communityCodes, setCommunityCodes] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCodeGenerated = (newCode) => {
    setCommunityCodes((prevCodes) => [...prevCodes, newCode]);
  };

  const handleAuthentication = () => {
    setIsAuthenticated(true);
    setUserRole(localStorage.getItem('userRole'));
    localStorage.setItem('isAuthenticated', 'true'); // Persist auth state
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    localStorage.setItem('isAuthenticated', 'false'); // Persist logout
    localStorage.clear();
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navigation isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/home" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/home" 
              element={
                isAuthenticated ? 
                  <HomePage /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route path="/login" element={!isAuthenticated ? <LoginPage onAuthenticate={handleAuthentication} /> : <Navigate to="/home" replace />} />
            <Route path="/signup" element={!isAuthenticated ? <SignupPage onAuthenticate={handleAuthentication} /> : <Navigate to="/home" replace />} />
            <Route path="/join-community" element={isAuthenticated && (userRole === 'user' || userRole === 'resident') ? <JoinCommunity validCodes={communityCodes} /> : <Navigate to="/login" replace />} />
            <Route path="/create-community" element={isAuthenticated && userRole === 'admin' ? <CreateCommunity onCodeGenerated={handleCodeGenerated} /> : <Navigate to="/login" replace />} />
            <Route path="/marketplace" element={isAuthenticated ? <BusinessPage /> : <Navigate to="/login" replace />} />
            <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />} />
            {/* Remove admin-dashboard route */}
            {/* <Route path="/admin-dashboard" element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} /> */}
            <Route path="/user-dashboard" element={isAuthenticated && userRole === 'user' ? <UserDashboard /> : <Navigate to="/login" replace />} />
            <Route path="/manage-users" element={isAuthenticated && userRole === 'admin' ? <ManageUsers /> : <Navigate to="/login" replace />} />
            <Route path="/event-calendar" element={isAuthenticated ? <EventCalendar /> : <Navigate to="/login" replace />} />
            <Route path="/sos" element={isAuthenticated && userRole !== 'admin' ? <SOS /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>

        {/* Floating Action Buttons: Chat left of SOS, both bottom right */}
        {isAuthenticated && (
          <div style={{position: 'fixed', bottom: 100, right: 32, display: 'flex', flexDirection: 'row', gap: '16px', zIndex: 1500}}>
            <button className="chat-float-btn" style={{position: 'static', margin: 0}} onClick={() => setIsChatOpen(true)}>
              Open Chat
            </button>
            {userRole !== 'admin' && <SOSButton />}
          </div>
        )}
        {isAuthenticated && isChatOpen && (
          <div className="chat-popup-overlay" onClick={() => setIsChatOpen(false)}>
            <div className="chat-popup-modal" onClick={e => e.stopPropagation()}>
              <button className="chat-popup-close" onClick={() => setIsChatOpen(false)}>&times;</button>
              <Chat />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
