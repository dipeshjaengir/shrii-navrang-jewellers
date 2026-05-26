const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Rates = require('../models/Rates');

// @desc    Get gold, silver rates and business email
// @route   GET /api/rates
// @access  Public
router.get('/', async (req, res) => {
  try {
    let rates = await Rates.findOne({});
    if (!rates) {
      rates = {
        gold24k: 7250,
        gold22k: 6650,
        silver: 90,
        businessEmail: 'info@shriinavrang.com',
        updatedAt: new Date().toISOString()
      };
    }
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update rates and email config
// @route   PUT /api/rates
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  const { gold24k, gold22k, silver, businessEmail } = req.body;

  if (!gold24k || !gold22k || !silver) {
    return res.status(400).json({ message: 'All rate fields are required' });
  }

  try {
    let rates = await Rates.findOne({});
    if (rates) {
      rates.gold24k = Number(gold24k);
      rates.gold22k = Number(gold22k);
      rates.silver = Number(silver);
      if (businessEmail) rates.businessEmail = businessEmail;
      await rates.save();
    } else {
      rates = await Rates.create({
        gold24k: Number(gold24k),
        gold22k: Number(gold22k),
        silver: Number(silver),
        businessEmail: businessEmail || 'info@shriinavrang.com'
      });
    }
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
