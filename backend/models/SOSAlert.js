const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  flatNumber: { type: String, required: true },
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  status: { type: String, enum: ['pending', 'notified', 'resolved'], default: 'pending' },
  notifiedContacts: [{ type: String }], // emails or phone numbers
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
