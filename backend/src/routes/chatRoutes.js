const express = require('express');
const { getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:pickupId', getChatHistory);

module.exports = router;
