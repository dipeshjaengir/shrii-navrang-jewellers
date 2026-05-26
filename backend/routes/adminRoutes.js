const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteUser,
  addProduct,
  editProduct,
  deleteProduct
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const { loginUser } = require('../controllers/authController');

router.post('/login', loginUser);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id', protect, admin, updateOrderStatus);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.post('/products', protect, admin, addProduct);
router.put('/products/:id', protect, admin, editProduct);
router.delete('/products/:id', protect, admin, deleteProduct);

module.exports = router;
