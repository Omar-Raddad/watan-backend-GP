const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  startConversationWithProductOwner,
  sendMessage,
  getMessages,
  getAllConversations
} = require('../controllers/messaginingController');

// Routes
router.get('/conversation', protect, getAllConversations); // Get all conversations for the user

router.post('/conversation', protect, startConversationWithProductOwner); // Start or get a conversation
router.post('/message', protect, sendMessage); // Send a message
router.get('/conversation/:conversationId/messages', protect, getMessages); // Get messages

module.exports = router;
