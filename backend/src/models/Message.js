const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  pickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup',
    required: false, // Changed from true to support general support chat
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isSupport: {
    type: Boolean,
    default: false
  },
  // The user involved in the support conversation (Citizen or Collector)
  supportUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
