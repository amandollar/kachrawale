
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
const WasteRate = require('../models/WasteRate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc      Get available completed pickups for sale
// @route     GET /api/marketplace
// @access    Private (Recycler)
exports.getAvailableListings = asyncHandler(async (req, res) => {
  // Find pickups that are COMPLETED (verified by collector) and not yet SOLD
  const listings = await Pickup.find({ status: 'COMPLETED' })
      .populate('collector', 'name')
      .sort('-updatedAt');

  res.status(200).json(new ApiResponse(200, listings));
});

// @desc      Purchase a pickup listing
// @route     POST /api/marketplace/:id/buy
// @access    Private (Recycler)
exports.purchaseListing = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);

  if (!pickup) {
    throw new ApiError(404, 'Listing not found');
  }

  if (pickup.status !== 'COMPLETED') {
    throw new ApiError(400, 'This listing is not available for purchase (Status must be COMPLETED)');
  }

  // Calculate Amount using database rates
  const weight = pickup.verifiedWeight || pickup.weight || 0;
  if (!weight || weight <= 0) {
      throw new ApiError(400, "Invalid pickup weight");
  }

  // Normalize waste type to match rate category
  let rateCategory;
  if (pickup.wasteType.toLowerCase() === 'e-waste') {
      rateCategory = 'E-Waste';
  } else {
      rateCategory = pickup.wasteType.charAt(0).toUpperCase() + pickup.wasteType.slice(1).toLowerCase();
  }

  // Find matching rate from database
  const wasteRate = await WasteRate.findOne({ 
    $or: [
      { name: pickup.wasteType.toLowerCase() },
      { category: rateCategory }
    ]
  }).sort({ price: -1 }); // Get highest matching rate if multiple

  if (!wasteRate) {
      throw new ApiError(500, `Market rate for category ${rateCategory} not found. Please contact admin.`);
  }

  const amount = Number((weight * wasteRate.price).toFixed(2));

  if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid pickup weight or amount");
  }

  // Create Transaction
  console.log('Using Pickup:', pickup);
  try {
      const transaction = await Transaction.create({
        pickup: pickup._id,
        recycler: req.user.id,
        citizen: pickup.citizen,
        collector: pickup.collector,
        amount: amount,
        status: 'COMPLETED', 
        type: 'PURCHASE'
      });
      
      // Update Pickup status
      pickup.status = 'SETTLED'; // Was 'SOLD' which failed enum validation
      await pickup.save();
    
      res.status(200).json(new ApiResponse(200, { transaction, pickup }, 'Purchase successful'));
  } catch (err) {
      console.error('TRANSACTION CREATE ERROR:', err);
      throw new ApiError(500, 'Transaction failed: ' + err.message);
  }
});
