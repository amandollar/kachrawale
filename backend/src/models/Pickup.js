
const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  wasteType: {
    type: String,
    enum: ['plastic', 'metal', 'e-waste', 'organic'],
    required: [true, 'Please specify waste type'],
  },
  weight: {
    type: Number,
    required: [true, 'Please estimate weight in kg'],
  },
  images: {
    type: [String],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one image is required',
    },
  },
  video: {
    type: String, // URL
  },
  location: {
    // Copied from User or specifically set for this pickup
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere',
    },
    formattedAddress: String,
  },
  status: {
    type: String,
    enum: [
      'CREATED',
      'MATCHING',
      'ASSIGNED',
      'ACCEPTED',
      'ON_THE_WAY',
      'ARRIVED',
      'COMPLETED',
      'SETTLED',
      'CANCELLED'
    ],
    default: 'CREATED',
  },
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedWeight: {
    type: Number,
    // Set by collector upon completion
  },
  finalAmount: {
    type: Number,
  },
  paymentMode: {
    type: String,
    enum: ['CASH', 'UPI', 'NONE'],
    default: 'NONE'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  verificationProof: {
    image: String,
    otp: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation: Video mandatory for non-organic
PickupSchema.pre('validate', function (next) {
  if (['plastic', 'metal', 'e-waste'].includes(this.wasteType)) {
    if (!this.video) {
        this.invalidate('video', 'Video is mandatory for Plastic, Metal, and E-waste');
    }
  }
  next();
});

module.exports = mongoose.model('Pickup', PickupSchema);
