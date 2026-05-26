const User = require('../models/User');
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'Shri_navrang_jewellers_secret_key_12345_luxury_brand_2026', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone.trim();

    // Verify existing user lookup before account creation (uniqueness validation)
    const emailExists = await User.findOne({ email: sanitizedEmail });
    const phoneExists = await User.findOne({ phone: sanitizedPhone });

    if (emailExists || phoneExists) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      password: hashedPassword,
      role: 'customer',
      addresses: [],
      wishlist: []
    });

    if (user) {
      // Initialize an empty cart for this user
      await Cart.create({
        userId: user._id,
        products: []
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server registration error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      console.log(`⚠️ [AUTH-LOGIN] Rejected: Missing email or password in request payload.`);
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const dbMode = global.useJsonDb ? 'JSON FILE FALLBACK' : 'MONGODB CONNECTION ACTIVE';
    console.log(`🔐 [AUTH-LOGIN] Attempt received. Email: "${sanitizedEmail}" (Original: "${email}"). Active DB Engine: [${dbMode}]`);

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      console.log(`❌ [AUTH-LOGIN] Lookup failed. No record found for email: "${sanitizedEmail}" under active DB [${dbMode}].`);
      return res.status(401).json({ message: 'Invalid email or user not found' });
    }

    console.log(`🔍 [AUTH-LOGIN] Lookup matched user: "${user.name}" with Role: "${user.role}". Hash signature: "${user.password ? user.password.substring(0, 15) : 'NONE'}...". Initiating password verification.`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ [AUTH-LOGIN] Verification rejected. Bcrypt signature mismatch for user "${user.name}" <${sanitizedEmail}>.`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`✨ [AUTH-LOGIN] Verification successful. Elevating session for Store Director / Client "${user.name}". Generating secure JWT.`);

    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('❌ [AUTH-LOGIN] Critical internal server crash during validation:', error);
    return res.status(500).json({ message: 'Server login error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Strip password
    const userObj = { ...user };
    delete userObj.password;
    
    return res.json(userObj);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    const updatedUser = await user.save();
    
    const userObj = { ...updatedUser };
    delete userObj.password;

    return res.json(userObj);
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
      await user.save();
      return res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
    } else {
      user.wishlist.splice(index, 1);
      await user.save();
      return res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error toggling wishlist', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleWishlist
};
