const mongoose = require('mongoose');

const businessListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  contactInfo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('BusinessListing', businessListingSchema);
