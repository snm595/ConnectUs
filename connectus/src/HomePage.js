import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './HomePage.css';

function HomePage() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: ''
  });
  const [communityName, setCommunityName] = useState('');

  // Get communityId from localStorage
  const communityId = localStorage.getItem('communityId');

  useEffect(() => {
    // Try to get community name from localStorage (set after join/create)
    let storedName = '';
    try {
      const communityStr = localStorage.getItem('community');
      if (communityStr) {
        const community = JSON.parse(communityStr);
        storedName = community.name || '';
      }
    } catch {}
    if (!storedName && communityId) {
      // Always fetch from backend if not found in localStorage
      fetch(`http://localhost:5000/api/community/${communityId}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          // Save community object to localStorage for next time
          if (data.community && data.community.name) {
            setCommunityName(data.community.name);
            localStorage.setItem('community', JSON.stringify(data.community));
          } else if (data.name) {
            setCommunityName(data.name);
            localStorage.setItem('community', JSON.stringify({ name: data.name }));
          } else {
            setCommunityName('');
          }
        })
        .catch(() => setCommunityName(''));
    } else {
      setCommunityName(storedName);
    }
  }, [communityId]);

  useEffect(() => {
    // Fetch events from backend
    if (communityId) {
      fetch(`http://localhost:5000/api/event/${communityId}`)
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(() => setEvents([]));
    }
  }, [communityId]);

  const getLocalDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = getLocalDateString(selectedDate);
  const filteredEvents = events.filter(event => event.date === formattedDate);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({ ...prev, date: getLocalDateString(date) }));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    // Check for valid communityId before proceeding
    if (!communityId) {
      alert('You must join or create a community before adding events.');
      return;
    }
    if (newEvent.title && newEvent.description && newEvent.location && newEvent.date) {
      // Always send date as YYYY-MM-DD
      const eventToSend = {
        ...newEvent,
        date: getLocalDateString(new Date(newEvent.date)),
        communityId
      };
      fetch('http://localhost:5000/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSend)
      })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json();
            alert(data.error || 'Failed to add event.');
            return;
          }
          return res.json();
        })
        .then(event => {
          if (event) {
            setEvents([...events, event]);
            setNewEvent({ title: '', description: '', location: '', date: '' });
          }
        })
        .catch(() => alert('Failed to add event.'));
    } else {
      alert('Please fill in all fields.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="homepage-container">
      <div className="welcome-banner">
        <h2>Welcome to ConnectUs</h2>
      </div>
      {communityName && (
        <div className="community-name-banner">
          <h1>{communityName}</h1>
        </div>
      )}
      <div className="home-page card">
        <div className="home-content">
          {/* Left Column - Calendar (shifted down) */}
          <div className="calendar-container" style={{ marginTop: '3rem' }}>
            <h2>Event Calendar</h2>
            <Calendar 
              onChange={handleDateChange} 
              value={selectedDate}
              tileClassName={({ date }) => {
                const formattedTileDate = getLocalDateString(date);
                return events.some(event => event.date === formattedTileDate) ? 'event-day' : null;
              }}
            />
          </div>
          {/* Right Column - Events and Form */}
          <div className="events-container">
            <h2>Events on {formatDate(formattedDate)}</h2>
            {filteredEvents.length === 0 ? (
              <p>No events for this date.</p>
            ) : (
              filteredEvents.map(event => (
                <div key={event._id || event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                </div>
              ))
            )}
            <form className="add-event-form" onSubmit={handleAddEvent}>
              <h3>Add New Event</h3>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <textarea
                placeholder="Event Description"
                value={newEvent.description}
                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Event Location"
                value={newEvent.location}
                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <input
                type="date"
                placeholder="Event Date"
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
              />
              <button type="submit" className="submit-button">List Event</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
