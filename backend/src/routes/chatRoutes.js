const express = require('express');
const { getChatHistory, getSupportHistory, getSupportConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/support/conversations', getSupportConversations);
router.get('/support', getSupportHistory);
router.get('/support/:userId', getSupportHistory);
router.get('/:pickupId', getChatHistory);

module.exports = router;
