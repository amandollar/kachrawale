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

// @desc    Get support chat history
// @route   GET /api/chat/support/:userId
// @access  Private
exports.getSupportHistory = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId || req.user.id;

  // Authorization: must be admin OR the user themselves
  if (req.user.role !== 'admin' && String(req.user.id) !== String(targetUserId)) {
    throw new ApiError(403, 'Not authorized to access this support chat');
  }

  const messages = await Message.find({ 
    isSupport: true, 
    supportUser: targetUserId 
  })
  .sort({ createdAt: 1 })
  .populate('sender', 'name profilePicture role');

  res.status(200).json(new ApiResponse(200, messages, 'Support history fetched'));
});

// @desc    Get all active support conversations (Admin only)
// @route   GET /api/chat/support/conversations
// @access  Private/Admin
exports.getSupportConversations = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Admin access required');
    }

    const conversations = await Message.aggregate([
        { $match: { isSupport: true } },
        { $sort: { createdAt: -1 } },
        { 
            $group: {
                _id: '$supportUser',
                lastMessage: { $first: '$$ROOT' }
            }
        },
        { 
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    
    res.status(200).json(new ApiResponse(200, conversations));
});
