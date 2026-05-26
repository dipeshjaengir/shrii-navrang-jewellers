const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  forgotPassword,
  resetPassword,
  getCustomerNotifications,
  markCustomerNotificationRead
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/wishlist', protect, toggleWishlist);

router.get('/notifications', protect, getCustomerNotifications);
router.put('/notifications/:id', protect, markCustomerNotificationRead);

module.exports = router;
