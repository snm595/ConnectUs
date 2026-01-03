const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const Community = require('../models/Community');
const { sendSMS } = require('../utils/notify');

// POST /api/sos
exports.sendSOS = async (req, res) => {
  try {
    const { flatNumber, type } = req.body;
    const userId = req.user.id;
    if (!flatNumber || !type) {
      return res.status(400).json({ message: 'Flat number and emergency type are required.' });
    }

    // Find user and community
    const user = await User.findById(userId).populate('community');
    if (!user || !user.community) {
      return res.status(404).json({ message: 'User or community not found.' });
    }

    // Create SOS alert
    const sosAlert = new SOSAlert({
      flatNumber,
      type,
      user: user._id,
      community: user.community._id,
    });
    await sosAlert.save();

    // Notify trusted contacts and neighbors (simplified: all other users in community except sender)
    const neighbors = await User.find({
      community: user.community._id,
      _id: { $ne: user._id }
    });
    // For SMS, trustedContacts and neighbor phone numbers
    const trustedContacts = user.trustedContacts || [];
    // Assume trustedContacts is an array of phone numbers (E.164 format)
    const neighborPhones = neighbors.map(n => n.phone).filter(Boolean);
    const allNotify = [...trustedContacts, ...neighborPhones];

    // Send notification (SMS)
    const text = `SOS Alert! Emergency Type: ${type}\nFrom: ${user.name} (Flat ${flatNumber})`;
    const smsResults = await sendSMS(allNotify, text);
    console.log('SMS Results:', smsResults);

    sosAlert.notifiedContacts = allNotify;
    sosAlert.status = 'notified';
    await sosAlert.save();

    res.status(201).json({ message: 'SOS alert sent and SMS notifications triggered.', smsResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send SOS alert.' });
  }
};
