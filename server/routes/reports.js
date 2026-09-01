const express = require('express');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// Daily report
router.get('/daily', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = new Date(date || new Date());
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const sales = await Sale.find({
      date: { $gte: reportDate, $lt: nextDay }
    }).populate('customer', 'name phone');

    const payments = await Payment.find({
      date: { $gte: reportDate, $lt: nextDay }
    }).populate('customer', 'name phone');

    const totalMilk = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      date: reportDate,
      sales,
      payments,
      totalMilk,
      totalRevenue,
      totalCollected,
      pending: totalRevenue - totalCollected
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Monthly report
router.get('/monthly', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const sales = await Sale.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('customer', 'name phone');

    const payments = await Payment.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('customer', 'name phone');

    const totalMilk = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    // Customer-wise summary
    const customerMap = {};
    sales.forEach(sale => {
      const custId = sale.customer._id.toString();
      if (!customerMap[custId]) {
        customerMap[custId] = {
          name: sale.customer.name,
          phone: sale.customer.phone,
          totalMilk: 0,
          totalAmount: 0
        };
      }
      customerMap[custId].totalMilk += sale.quantity;
      customerMap[custId].totalAmount += sale.totalAmount;
    });

    res.json({
      month: m,
      year: y,
      sales,
      payments,
      totalMilk,
      totalRevenue,
      totalCollected,
      pending: totalRevenue - totalCollected,
      customerSummary: Object.values(customerMap)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer-wise report
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { customer: req.params.customerId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const sales = await Sale.find(query).populate('customer', 'name phone');
    const payments = await Payment.find({ customer: req.params.customerId });

    const totalMilk = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalBilled = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      customer: sales[0]?.customer,
      sales,
      payments,
      totalMilk,
      totalBilled,
      totalPaid,
      pending: totalBilled - totalPaid
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
