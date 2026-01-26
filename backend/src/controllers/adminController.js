
const Pickup = require('../models/Pickup');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc      Get Dashboard Stats (KPIs)
// @route     GET /api/admin/stats
// @access    Private (Admin)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Total Pickups
  const totalPickups = await Pickup.countDocuments();

  // 2. Total Weight (Verified + Estimated)
  const weightStats = await Pickup.aggregate([
    {
      $group: {
        _id: null,
        totalEstimated: { $sum: '$weight' },
        totalVerified: { $sum: '$verifiedWeight' }
      }
    }
  ]);

  // 3. Waste Type Breakdown
  const wasteTypeStats = await Pickup.aggregate([
    {
      $group: {
        _id: '$wasteType',
        count: { $sum: 1 },
        weight: { $sum: '$weight' }
      }
    }
  ]);

  // 4. Status Breakdown
  const statusStats = await Pickup.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // 5. Total Users
  const citizenCount = await User.countDocuments({ role: 'citizen' });
  const collectorCount = await User.countDocuments({ role: 'collector' });

  res.status(200).json(new ApiResponse(200, {
    pickups: {
      total: totalPickups,
      byStatus: statusStats,
      byType: wasteTypeStats
    },
    weight: weightStats[0] || { totalEstimated: 0, totalVerified: 0 },
    users: {
      citizens: citizenCount,
      collectors: collectorCount
    }
  }));
});

// @desc      Get Heatmap Data (GeoJSON)
// @route     GET /api/admin/heatmap
// @access    Private (Admin)
exports.getHeatmapData = asyncHandler(async (req, res) => {
  const pickups = await Pickup.find({}, 'location weight wasteType');

  const points = pickups.map(p => ({
    lat: p.location.coordinates[1],
    lng: p.location.coordinates[0],
    weight: p.weight,
    type: p.wasteType
  }));

  res.status(200).json(new ApiResponse(200, points));
});

// @desc      Get Pending Verifications
// @route     GET /api/admin/verifications
// @access    Private (Admin)
exports.getPendingVerifications = asyncHandler(async (req, res) => {
  const users = await User.find({ isVerified: false, role: { $in: ['collector', 'recycler'] } });
  res.status(200).json(new ApiResponse(200, users));
});

// @desc      Verify User
// @route     PUT /api/admin/verify/:id
// @access    Private (Admin)
exports.verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isVerified = true;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, 'User verified successfully'));
});
// @desc      Reject User (Delete)
// @route     DELETE /api/admin/reject/:id
// @access    Private (Admin)
exports.rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, 'User application rejected and removed'));
});
