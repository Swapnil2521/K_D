const express = require('express');
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sales
router.get('/', auth, async (req, res) => {
  try {
    const { date, customerId, startDate, endDate } = req.query;
    let query = {};

    if (customerId) {
      query.customer = customerId;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const sales = await Sale.find(query)
      .populate('customer', 'name phone')
      .sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's sales summary
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await Sale.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('customer', 'name phone');

    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    res.json({
      sales,
      totalQuantity,
      totalAmount,
      totalSales: sales.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get customer sales history
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const sales = await Sale.find({ customer: req.params.customerId })
      .populate('customer', 'name phone')
      .sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add sale
router.post('/', auth, async (req, res) => {
  const sale = new Sale(req.body);
  try {
    const newSale = await sale.save();
    const populated = await Sale.findById(newSale._id).populate('customer', 'name phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete sale
router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
