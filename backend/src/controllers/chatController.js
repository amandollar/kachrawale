const Message = require('../models/Message');
const Pickup = require('../models/Pickup');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get chat history for a pickup
// @route   GET /api/chat/:pickupId
// @access  Private
exports.getChatHistory = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.pickupId);

  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Check if user is authorized to see this chat
  const isCitizen = String(pickup.citizen) === String(req.user.id);
  const isCollector = String(pickup.collector) === String(req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (!isCitizen && !isCollector && !isAdmin) {
    throw new ApiError(403, 'Not authorized to access this chat');
  }

  const messages = await Message.find({ pickup: req.params.pickupId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profilePicture');

  res.status(200).json(new ApiResponse(200, messages, 'Chat history fetched'));
});
