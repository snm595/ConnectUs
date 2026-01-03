import React, { useState } from 'react';
import './SOSButton.css';

// Example: Replace with your actual user context if available
// import { UserContext } from '../context/UserContext';

const getUserFlatNumber = () => {
    // Try to fetch from a user object in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.flatNumber || '';
      } catch {
        return '';
      }
    }
    // Fallback: direct flatNumber storage
    return localStorage.getItem('flatNumber') || '';
  };

const SOSButton = () => {
  const [isAlerting, setIsAlerting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [type, setType] = useState('');
  const [otherFlat, setOtherFlat] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState(''); // 'own' or 'another'

  const userFlatNumber = getUserFlatNumber();

  const handleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSOSOwnFlat = () => {
    setMode('own');
    setType('');
    setDropdownOpen(false);
  };

  const handleSOSAnotherFlat = () => {
    setMode('another');
    setType('');
    setOtherFlat('');
    setDescription('');
    setDropdownOpen(false);
  };

  const handleSend = async () => {
    setIsAlerting(true);
    try {
      const token = localStorage.getItem('token');
      let payload;
      if (mode === 'own') {
        if (!userFlatNumber || !type) {
          alert('Your flat number is missing or emergency type not selected.');
          setIsAlerting(false);
          return;
        }
        payload = { flatNumber: userFlatNumber, type };
      } else {
        if (!otherFlat || !type || !description) {
          alert('Please fill all fields for another flat.');
          setIsAlerting(false);
          return;
        }
        payload = { flatNumber: otherFlat, type: `${type} - ${description}` };
      }
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert('SOS Alert sent successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to send SOS Alert.');
      }
    } catch (error) {
      alert('Error while sending SOS alert.');
    } finally {
      setIsAlerting(false);
      setMode('');
      setType('');
      setOtherFlat('');
      setDescription('');
    }
  };

  return (
    <div className="sos-float-btn">
      <div className="sos-button-container">
        {mode === '' && (
          <>
            <button className="sos-button" onClick={handleDropdown} disabled={isAlerting}>
              SOS
            </button>
            {dropdownOpen && (
              <div className="sos-dropdown">
                <button className="sos-dropdown-item" onClick={handleSOSOwnFlat} disabled={isAlerting}>
                  SOS – Own Flat
                </button>
                <button className="sos-dropdown-item" onClick={handleSOSAnotherFlat} disabled={isAlerting}>
                  Another Flat?
                </button>
              </div>
            )}
          </>
        )}
        {mode === 'own' && (
          <div className="sos-popup">
            <div className="sos-popup-title">Send SOS for Your Flat</div>
            <div className="sos-popup-label">Flat Number: <b>{userFlatNumber || 'N/A'}</b></div>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              disabled={isAlerting}
              className="sos-popup-select"
            >
              <option value="">Select Emergency Type</option>
              <option value="Medical">Medical</option>
              <option value="Fire">Fire</option>
              <option value="Break-in">Break-in</option>
              <option value="Other">Other</option>
            </select>
            <div className="sos-popup-actions">
              <button className="sos-popup-cancel" onClick={() => setMode('')} disabled={isAlerting}>Cancel</button>
              <button className="sos-popup-send" onClick={handleSend} disabled={isAlerting || !type}>
                {isAlerting ? 'Sending...' : 'Send SOS'}
              </button>
            </div>
          </div>
        )}
        {mode === 'another' && (
          <div className="sos-popup">
            <div className="sos-popup-title">Send SOS for Another Flat</div>
            <input
              type="text"
              className="sos-popup-input"
              placeholder="Flat Number"
              value={otherFlat}
              onChange={e => setOtherFlat(e.target.value)}
              disabled={isAlerting}
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              disabled={isAlerting}
              className="sos-popup-select"
            >
              <option value="">Select Emergency Type</option>
              <option value="Medical">Medical</option>
              <option value="Fire">Fire</option>
              <option value="Break-in">Break-in</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              className="sos-popup-textarea"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isAlerting}
            />
            <div className="sos-popup-actions">
              <button className="sos-popup-cancel" onClick={() => setMode('')} disabled={isAlerting}>Cancel</button>
              <button className="sos-popup-send" onClick={handleSend} disabled={isAlerting || !otherFlat || !type || !description}>
                {isAlerting ? 'Sending...' : 'Send SOS'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSButton;
