const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online', 'Other'],
    default: 'Cash'
  },
  note: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
