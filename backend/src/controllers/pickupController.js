
const Pickup = require('../models/Pickup');
const { findBestCollectors } = require('../services/matchingService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createPickup = asyncHandler(async (req, res) => {
  req.body.citizen = req.user.id;

  if (req.files) {
      if (req.files.images) {
          req.body.images = req.files.images.map(f => f.path);
      }
      if (req.files.video && req.files.video.length > 0) {
          req.body.video = req.files.video[0].path;
      }
  }

  const pickup = await Pickup.create(req.body);
  const collectors = await findBestCollectors(pickup);
  
  if (req.io) {
      req.io.emit('new_pickup', { 
          pickupId: pickup._id, 
          location: pickup.location,
          wasteType: pickup.wasteType 
      });
      console.log(`Emitted new_pickup to ${collectors.length} potential collectors`);
  }

  res.status(201).json(new ApiResponse(201, pickup, 'Pickup created successfully'));
});

exports.getPickups = asyncHandler(async (req, res) => {
  let query;
  const userId = req.user.id; 
  
  if (req.user.role === 'citizen') {
    query = Pickup.find({ citizen: userId });
  } else if (req.user.role === 'collector') {
    query = Pickup.find({
      $or: [
        { status: { $in: ['CREATED', 'MATCHING'] } },
        { collector: userId }
      ]
    });
  } else if (req.user.role === 'admin') {
    query = Pickup.find();
  } else {
     query = Pickup.find({ status: 'COMPLETED' });
  }
  const pickups = await query.populate('citizen', 'name phone');
  res.status(200).json(new ApiResponse(200, pickups));
});

exports.getPickup = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id)
      .populate('citizen', 'name phone')
      .populate('collector', 'name phone');

  if (!pickup) {
      throw new ApiError(404, 'Pickup not found');
  }
  res.status(200).json(new ApiResponse(200, pickup));
});

exports.updatePickupStatus = asyncHandler(async (req, res) => {
  let pickup = await Pickup.findById(req.params.id);
  
  if (!pickup) {
      throw new ApiError(404, 'Pickup not found');
  }

  const { status } = req.body;
  
  if (req.user.role === 'collector') {
      if (status === 'ACCEPTED') {
          if (pickup.status !== 'CREATED' && pickup.status !== 'MATCHING') {
              throw new ApiError(400, 'Pickup not available');
          }
          pickup.collector = req.user.id;
      } else {
           const currentCollectorId = pickup.collector ? String(pickup.collector) : null;
           if (currentCollectorId !== req.user.id) {
               throw new ApiError(401, 'Not authorized');
           }
      }
  }

  if (status) pickup.status = status;
  if (req.body.verifiedWeight) pickup.verifiedWeight = req.body.verifiedWeight;

  await pickup.save();

  if (req.io) {
      req.io.emit('pickup_status_updated', {
          pickupId: pickup._id,
          status: pickup.status,
          citizenId: pickup.citizen,
          collectorId: pickup.collector
      });
  }

  res.status(200).json(new ApiResponse(200, pickup, 'Status updated'));
});
