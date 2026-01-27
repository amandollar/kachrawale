
const Pickup = require('../models/Pickup');
const WasteRate = require('../models/WasteRate');
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
  
  if (req.io && collectors.length > 0) {
      // Notify only the matched collectors within radius
      collectors.forEach(collector => {
          req.io.to(`user_${collector._id}`).emit('new_pickup', { 
              pickupId: pickup._id, 
              location: pickup.location,
              wasteType: pickup.wasteType 
          });
      });
      console.log(`Notified ${collectors.length} collectors within 10km radius`);
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
  const { status, verifiedWeight, paymentMode, isPaid } = req.body;
  const pickupId = req.params.id;

  // 1. ATOMIC ACCEPTANCE LOGIC (Concurrency Fix)
  if (req.user.role === 'collector' && status === 'ACCEPTED') {
      const pickup = await Pickup.findOneAndUpdate(
          { _id: pickupId, status: { $in: ['CREATED', 'MATCHING'] } },
          { 
              status: 'ACCEPTED', 
              collector: req.user.id 
          },
          { new: true }
      ).populate('citizen', 'name phone');

      if (!pickup) {
          throw new ApiError(400, 'Pickup is no longer available or already accepted by another collector');
      }

      if (req.io) {
          const payload = {
              pickupId: pickup._id,
              status: pickup.status,
              citizenId: pickup.citizen._id || pickup.citizen,
              collectorId: pickup.collector
          };
          
          // Notify the specific citizen
          req.io.to(`user_${payload.citizenId}`).emit('pickup_status_updated', payload);
          
          // Notify the specific collector
          req.io.to(`user_${payload.collectorId}`).emit('pickup_status_updated', payload);
      }

      return res.status(200).json(new ApiResponse(200, pickup, 'Pickup accepted successfully'));
  }

  // 2. STANDARD STATUS UPDATES
  let pickup = await Pickup.findById(pickupId);
  
  if (!pickup) {
      throw new ApiError(404, 'Pickup not found');
  }

  // Auth check for non-admin updates
  if (req.user.role !== 'admin') {
      const currentCollectorId = pickup.collector ? String(pickup.collector) : null;
      if (currentCollectorId !== req.user.id) {
          throw new ApiError(401, 'Not authorized to update this pickup');
      }
  }

  // 3. SECURE PRICE CALCULATION (Payment Security)
  if (status === 'COMPLETED') {
      if (verifiedWeight === undefined) {
          throw new ApiError(400, 'Verified weight is required to complete pickup');
      }

      // Fetch the rate from DB (Backend-side truth)
      // Normalize casing: 
      // 'e-waste' -> 'E-Waste'
      // 'paper' -> 'Paper'
      let rateCategory;
      if (pickup.wasteType.toLowerCase() === 'e-waste') {
          rateCategory = 'E-Waste';
      } else {
          rateCategory = pickup.wasteType.charAt(0).toUpperCase() + pickup.wasteType.slice(1).toLowerCase();
      }
      const wasteRate = await WasteRate.findOne({ category: rateCategory });

      if (!wasteRate) {
          throw new ApiError(500, `Market rate for category ${rateCategory} not found`);
      }

      pickup.verifiedWeight = verifiedWeight;
      pickup.finalAmount = Number((verifiedWeight * wasteRate.price).toFixed(2));
      pickup.status = 'COMPLETED';
      pickup.paymentMode = paymentMode || 'NONE';
      pickup.isPaid = isPaid || false;
  } else {
      if (status) pickup.status = status;
      if (verifiedWeight !== undefined) pickup.verifiedWeight = verifiedWeight;
      if (paymentMode) pickup.paymentMode = paymentMode;
      if (isPaid !== undefined) pickup.isPaid = isPaid;
  }

  await pickup.save();

  if (req.io) {
      const payload = {
          pickupId: pickup._id,
          status: pickup.status,
          citizenId: pickup.citizen,
          collectorId: pickup.collector
      };

      // Notify the specific citizen
      req.io.to(`user_${pickup.citizen}`).emit('pickup_status_updated', payload);
      
      // Notify the specific collector
      if (pickup.collector) {
          req.io.to(`user_${pickup.collector}`).emit('pickup_status_updated', payload);
      }

      // Also notify anyone watching the specific pickup tracking room
      req.io.to(`pickup_${pickup._id}`).emit('pickup_status_updated', payload);
  }

  res.status(200).json(new ApiResponse(200, pickup, 'Status updated successfully'));
});
