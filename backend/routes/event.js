const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const fs = require('fs');

// Get all events for a community
router.get('/:communityId', async (req, res) => {
  try {
    const events = await Event.find({ communityId: req.params.communityId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// Add a new event
router.post('/', async (req, res) => {
  try {
    const { communityId, title, description, location, date } = req.body;
    // Log the incoming body for debugging
    console.log('Received event POST:', req.body);
    fs.appendFileSync('event_debug.log', JSON.stringify(req.body) + '\n');

    if (!communityId || !title || !description || !location || !date) {
      console.log('Validation failed:', { communityId, title, description, location, date });
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const event = new Event({ communityId, title, description, location, date });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// (Optional) Delete an event
router.delete('/:eventId', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

module.exports = router;
