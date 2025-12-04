const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getAllChats,
  updateChatStatus
} = require('../controllers/chatController');
const { protect, pharmacist } = require('../middleware/auth');

// Public routes
router.post('/message', sendMessage);
router.get('/history/:sessionId', getChatHistory);

// Admin routes
router.get('/all', protect, pharmacist, getAllChats);
router.put('/:sessionId/status', protect, pharmacist, updateChatStatus);

module.exports = router;
