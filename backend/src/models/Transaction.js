
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  pickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup',
    required: true,
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recycler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['PAYOUT', 'PURCHASE'], // PAYOUT (Col->Cit), PURCHASE (Rec->Col)
    default: 'PAYOUT'
  },
  points: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'COMPLETED'],
    default: 'PENDING',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
