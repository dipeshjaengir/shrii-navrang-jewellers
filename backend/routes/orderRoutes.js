const express = require('express');
const router = express.Router();
const { placeOrder, getOrderHistory, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/', protect, getOrderHistory);
router.get('/history', protect, getOrderHistory);
router.get('/:id', protect, getOrderById);

module.exports = router;
