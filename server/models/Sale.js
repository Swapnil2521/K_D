const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  ratePerLitre: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Sale', saleSchema);
