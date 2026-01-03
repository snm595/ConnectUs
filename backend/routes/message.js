const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get all messages for a community
// Get all messages for a community
router.get('/:communityId', auth, async (req, res) => {
  try {
    const { communityId } = req.params;
    console.log('Fetching messages for community:', communityId);
    
    // Find messages and populate sender details
    let messages = await Message.find({ communityId })
      .sort({ time: 1 })
      .lean();
    
    // Get all unique sender IDs
    const senderIds = [...new Set(messages.map(msg => msg.sender))];
    
    // Fetch all senders' details at once
    const User = require('../models/User');
    const senders = await User.find({ 
      _id: { $in: senderIds } 
    }).select('name email').lean();
    
    // Create a map of sender IDs to their details
    const senderMap = {};
    senders.forEach(sender => {
      senderMap[sender._id] = {
        name: sender.name,
        email: sender.email
      };
    });
    
    // Process messages to ensure we have proper sender names
    const processedMessages = messages.map(msg => {
      const senderInfo = senderMap[msg.sender] || {};
      const displayName = msg.senderName || 
                         senderInfo.name || 
                         (senderInfo.email ? senderInfo.email.split('@')[0] : 'User') + 
                         (msg.sender ? `-${msg.sender.toString().substring(0, 4)}` : '');
      
      return {
        ...msg,
        senderName: displayName,
        isOwnMessage: msg.sender.toString() === req.user.id
      };
    });
    
    console.log(`Found ${processedMessages.length} messages for community ${communityId}`);
    res.json(processedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});
// Post a new message to a community
router.post('/:communityId', auth, async (req, res) => {
  try {
    const { communityId } = req.params;
    const { text } = req.body;
    const sender = req.user.id;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text required.' });
    }
    
    // Get user details with a fresh query to ensure we have the latest data
    const User = require('../models/User');
    const user = await User.findById(sender).select('name email').lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Determine the best display name - prioritize name, then email username, then user ID
    const displayName = user.name || 
                       (user.email ? user.email.split('@')[0] : 'User') + 
                       (user._id ? `-${user._id.toString().substring(0, 4)}` : '');
    
    console.log('Posting message to community:', communityId, 'by user:', displayName);
    
    // Create and save the message with the user's name
    const message = new Message({
      communityId,
      sender: user._id,
      senderName: displayName, // Store the actual name
      text: text.trim(),
      time: new Date()
    });
    
    await message.save();
    console.log('Message saved:', { 
      messageId: message._id,
      sender: user._id,
      senderName: displayName,
      text: text.trim().substring(0, 20) + (text.length > 20 ? '...' : '')
    });
    
    // Return the message with all necessary fields
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');
    
    res.status(201).json({
      ...populatedMessage.toObject(),
      sender: user._id,
      senderName: displayName
    });
  } catch (err) {
    console.error('Error posting message:', err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

module.exports = router;
