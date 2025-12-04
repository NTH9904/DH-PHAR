const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'Khách'
  },
  userEmail: {
    type: String,
    default: null
  },
  userPhone: {
    type: String,
    default: null
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'resolved', 'archived'],
    default: 'active'
  },
  tags: [String],
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ChatMessageSchema.index({ sessionId: 1, createdAt: -1 });
ChatMessageSchema.index({ userId: 1 });
ChatMessageSchema.index({ status: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
