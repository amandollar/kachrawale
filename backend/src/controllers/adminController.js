
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

// @desc      Get Collector Payouts (Admin)
// @route     GET /api/admin/payouts
// @access    Private (Admin)
exports.getCollectorPayouts = asyncHandler(async (req, res) => {
  const payouts = await Pickup.aggregate([
    { $match: { status: 'COMPLETED' } },
    {
      $group: {
        _id: '$collector',
        totalTrips: { $sum: 1 },
        totalWeight: { $sum: '$verifiedWeight' },
        totalValue: { $sum: '$finalAmount' },
        cashSpent: {
          $sum: {
             $cond: [{ $eq: ['$paymentMode', 'CASH'] }, '$finalAmount', 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'collectorInfo'
      }
    },
    { $unwind: '$collectorInfo' },
    {
      $project: {
        _id: 1,
        name: '$collectorInfo.name',
        email: '$collectorInfo.email',
        phone: '$collectorInfo.phone',
        vehicle: '$collectorInfo.collectorDetails.vehicleNumber',
        totalTrips: 1,
        totalWeight: 1,
        totalValue: 1,
        cashSpent: 1,
        commission: { $multiply: ['$totalValue', 0.10] }, // 10% Commission
        totalPayable: { 
            $add: [
                { $multiply: ['$totalValue', 0.10] }, // Commission
                '$cashSpent' // Reimbursement
            ] 
        }
      }
    }
  ]);

  res.status(200).json(new ApiResponse(200, payouts));
});

// @desc      Get My Stats (Collector)
// @route     GET /api/collector/stats
// @access    Private (Collector)
exports.getCollectorMyStats = asyncHandler(async (req, res) => {
    // 1. Completed Pickups Stats
    const stats = await Pickup.aggregate([
        { 
            $match: { 
                collector: new mongoose.Types.ObjectId(req.user.id),
                status: 'COMPLETED'
            } 
        },
        {
            $group: {
                _id: null,
                totalTrips: { $sum: 1 },
                totalWeight: { $sum: '$verifiedWeight' },
                totalValue: { $sum: '$finalAmount' },
                cashSpent: {
                    $sum: {
                        $cond: [{ $eq: ['$paymentMode', 'CASH'] }, '$finalAmount', 0]
                    }
                }
            }
        }
    ]);

    const data = stats[0] || { totalTrips: 0, totalWeight: 0, totalValue: 0, cashSpent: 0 };
    
    // Add calculated fields
    const response = {
        ...data,
        commission: data.totalValue * 0.10,
        totalEarnings: (data.totalValue * 0.10) // Only commission is "earnings", cashSpent is reimbursement
    };

    res.status(200).json(new ApiResponse(200, response));
});
