
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

  // Send Confirmation Email with Images
  try {
      const imageHtml = pickup.images && pickup.images.length > 0 
          ? `<div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
               ${pickup.images.map(img => `<img src="${img}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />`).join('')}
             </div>`
          : '';

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #059669; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Clean & Green</h1>
                <p style="color: #ecfdf5; margin: 5px 0 0; font-size: 14px;">Pickup Confirmation</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #064e3b; margin-top: 0;">Request Received! 🚛</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    Hello, <br/><br/>
                    We have received your request for a <strong>${pickup.wasteType.toUpperCase()}</strong> pickup. 
                    Our collectors in your area have been notified and will accept the request shortly.
                </p>
                
                <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #065f46;"><strong>Weight:</strong> ${pickup.weight} kg</p>
                    <p style="margin: 5px 0; color: #065f46;"><strong>Location:</strong> ${(() => {
                        try {
                            if (!req.body.location) return 'Pinned on Map';
                            const location = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
                            return location.formattedAddress || 'Pinned on Map';
                        } catch (e) {
                            return 'Pinned on Map';
                        }
                    })()}</p>
                </div>

                <p style="color: #4b5563; font-weight: bold;">Waste Photos:</p>
                ${imageHtml}

                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Pickup</a>
                </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                &copy; ${new Date().getFullYear()} Clean & Green. All rights reserved.
            </div>
        </div>
      `;
      
      const sendEmail = require('../services/emailService');
      await sendEmail({
          email: req.user.email,
          subject: 'Pickup Request Received - Clean & Green',
          message: `Your pickup request for ${pickup.wasteType} has been received.`,
          html: emailHtml
      });
  } catch (err) {
      console.error("Failed to send pickup confirmation email", err);
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
          const citizenId = pickup.citizen?._id || pickup.citizen || null;
          const payload = {
              pickupId: pickup._id,
              status: pickup.status,
              citizenId: citizenId,
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
      // Try to find rate by name first, then by category
      const wasteRate = await WasteRate.findOne({ 
        $or: [
          { name: pickup.wasteType.toLowerCase() },
          { category: rateCategory }
        ]
      }).sort({ price: -1 }); // Get highest matching rate if multiple

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
      const citizenId = pickup.citizen?._id || pickup.citizen || null;
      const collectorId = pickup.collector?._id || pickup.collector || null;
      const payload = {
          pickupId: pickup._id,
          status: pickup.status,
          citizenId: citizenId,
          collectorId: collectorId
      };

      // Notify the specific citizen
      if (citizenId) {
          req.io.to(`user_${citizenId}`).emit('pickup_status_updated', payload);
      }
      
      // Notify the specific collector
      if (collectorId) {
          req.io.to(`user_${collectorId}`).emit('pickup_status_updated', payload);
      }

      // Also notify anyone watching the specific pickup tracking room
      req.io.to(`pickup_${pickup._id}`).emit('pickup_status_updated', payload);
  }

  res.status(200).json(new ApiResponse(200, pickup, 'Status updated successfully'));
});
