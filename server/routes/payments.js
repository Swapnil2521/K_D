const express = require('express');
const Payment = require('../models/Payment');
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    let query = {};

    if (customerId) {
      query.customer = customerId;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const payments = await Payment.find(query)
      .populate('customer', 'name phone')
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get customer payment summary
router.get('/summary/:customerId', auth, async (req, res) => {
  try {
    const sales = await Sale.find({ customer: req.params.customerId });
    const payments = await Payment.find({ customer: req.params.customerId });

    const totalBilled = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const pending = totalBilled - totalPaid;

    let status = 'Pending';
    if (pending <= 0) status = 'Paid';
    else if (totalPaid > 0) status = 'Partial';

    res.json({
      totalBilled,
      totalPaid,
      pending,
      status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add payment
router.post('/', auth, async (req, res) => {
  const payment = new Payment(req.body);
  try {
    const newPayment = await payment.save();
    const populated = await Payment.findById(newPayment._id).populate('customer', 'name phone');
    
    // Update sale payment status
    const customerSales = await Sale.find({ 
      customer: req.body.customer,
      paymentStatus: { $ne: 'Paid' }
    }).sort({ date: 1 });

    let remainingAmount = req.body.amount;
    for (let sale of customerSales) {
      if (remainingAmount <= 0) break;
      
      const pendingForSale = sale.totalAmount - sale.paidAmount;
      const toPay = Math.min(remainingAmount, pendingForSale);
      
      sale.paidAmount += toPay;
      remainingAmount -= toPay;
      
      if (sale.paidAmount >= sale.totalAmount) {
        sale.paymentStatus = 'Paid';
      } else if (sale.paidAmount > 0) {
        sale.paymentStatus = 'Partial';
      }
      
      await sale.save();
    }
    
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete payment
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
