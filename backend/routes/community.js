const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new community and assign admin
router.post('/create', async (req, res) => {
  try {
    const { name, code, adminId } = req.body;
    if (!name || !code || !adminId) {
      return res.status(400).json({ message: 'Name, code, and adminId are required.' });
    }
    // Create community
    const community = new Community({ name, code, admin: adminId, residents: [adminId] });
    await community.save();
    // Update user to have this community
    await User.findByIdAndUpdate(adminId, { community: community._id });
    res.status(201).json({ message: 'Community created.', community });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create community.', error: err.message });
  }
});

// Join an existing community
router.post('/join', async (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ message: 'Code and userId are required.' });
    }
    const community = await Community.findOne({ code });
    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }
    // Add user to residents if not already present
    if (!community.residents.some(id => id.equals(userId))) {
      community.residents.push(userId);
      await community.save();
    }
    // Update user to have this community
    await User.findByIdAndUpdate(userId, { community: community._id });
    res.status(200).json({ message: 'Joined community.', community });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join community.', error: err.message });
  }
});

// GET community info by ID (for HomePage name display)
router.get('/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID.' });
    }
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }
    res.json({ community });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch community.', error: err.message });
  }
});

// GET all users in a community by communityId
router.get('/:communityId/users', async (req, res) => {
  try {
    const { communityId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID.' });
    }
    const community = await Community.findById(communityId).populate('residents');
    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }
    res.json({ users: community.residents });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
});

module.exports = router;
