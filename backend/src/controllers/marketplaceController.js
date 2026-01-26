
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
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

  // Calculate Amount (Simple logic: weight * rough rate)
  // Rates: Plastic=10, Metal=20, E-waste=50, Organic=1
  const rates = { plastic: 10, metal: 20, 'e-waste': 50, organic: 1 };
  const rate = rates[pickup.wasteType] || 1;
  const weight = pickup.verifiedWeight || pickup.weight || 0;
  const amount = weight * rate;

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
