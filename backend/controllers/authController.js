const User = require('../models/User');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendEmail, sendSMS } = require('../services/otpService');

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

    // Validate Indian 10-digit phone format (digits only, starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(sanitizedPhone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)' });
    }

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
      console.log(`⚠️ [AUTH-LOGIN] Rejected: Missing email/phone or password in request payload.`);
      return res.status(400).json({ message: 'Please provide email/phone and password' });
    }

    const identifier = email.trim();
    const dbMode = global.useJsonDb ? 'JSON FILE FALLBACK' : 'MONGODB CONNECTION ACTIVE';
    console.log(`🔐 [AUTH-LOGIN] Attempt received. Identifier: "${identifier}". Active DB Engine: [${dbMode}]`);

    let user;
    if (identifier.includes('@')) {
      const sanitizedEmail = identifier.toLowerCase();
      user = await User.findOne({ email: sanitizedEmail });
    } else {
      console.log(`🔍 [AUTH-LOGIN] Identifier matches phone format. Performing phone query for "${identifier}"...`);
      user = await User.findOne({ phone: identifier });
      
      if (!user) {
        // Try normalized digits match
        const digitsOnly = identifier.replace(/\D/g, '');
        if (digitsOnly.length >= 8) {
          const rawUsers = await User.find({});
          const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
          user = users.find(u => {
            if (!u.phone) return false;
            const uDigits = u.phone.replace(/\D/g, '');
            return uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits);
          });
        }
      }
    }

    if (!user) {
      console.log(`❌ [AUTH-LOGIN] Lookup failed. No record found for identifier: "${identifier}" under active DB [${dbMode}].`);
      return res.status(401).json({ message: 'Invalid email/phone or user not found' });
    }

    console.log(`🔍 [AUTH-LOGIN] Lookup matched user: "${user.name}" with Role: "${user.role}". Hash signature: "${user.password ? user.password.substring(0, 15) : 'NONE'}...". Initiating password verification.`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ [AUTH-LOGIN] Verification rejected. Bcrypt signature mismatch for user "${user.name}" <${user.email}>.`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Save dynamic last login activity
    user.lastLogin = new Date().toISOString();
    await user.save();
    console.log(`✓ [AUTH-LOGIN] Updated lastLogin timestamp in database for "${user.name}".`);

    console.log(`✨ [AUTH-LOGIN] Verification successful. Elevating session for Store Director / Client "${user.name}". Generating secure JWT.`);

    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      lastLogin: user.lastLogin,
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

const forgotPassword = async (req, res) => {
  const { identifier, method } = req.body;
  try {
    if (!identifier) {
      return res.status(400).json({ message: 'Please enter your registered email or mobile number' });
    }

    const searchStr = identifier.trim();
    let user;
    
    if (searchStr.includes('@')) {
      const sanitizedEmail = searchStr.toLowerCase();
      user = await User.findOne({ email: sanitizedEmail });
    } else {
      const digitsOnly = searchStr.replace(/\D/g, '');
      user = await User.findOne({ phone: digitsOnly });
      if (!user && digitsOnly.length >= 8) {
        const rawUsers = await User.find({});
        const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
        user = users.find(u => {
          if (!u.phone) return false;
          const uDigits = u.phone.replace(/\D/g, '');
          return uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits);
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with that email or mobile number' });
    }

    // Abuse protection: limit requests to once per minute
    if (user.lastOtpRequest && (Date.now() - new Date(user.lastOtpRequest).getTime()) < 60000) {
      const secondsLeft = Math.ceil((60000 - (Date.now() - new Date(user.lastOtpRequest).getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${secondsLeft} second(s) before requesting another recovery code.` });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set 10 minutes expiration (600000 ms)
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    user.otpAttempts = 0;
    user.lastOtpRequest = new Date().toISOString();
    
    await user.save();

    console.log(`🔑 [OTP-SECURITY] Secure Reset Flow: Generated OTP ${otp} for User: "${user.name}" (${user.email || user.phone}). Expiry: 10 mins. (Delivering via ${method || 'email'})`);

    const deliveryMethod = method || 'email';
    
    if (deliveryMethod === 'sms') {
      const smsMsg = `Your Shri Navrang Jewellers secure password reset code is ${otp}. It is valid for 10 minutes only. Purity • Trust • Perfection`;
      const smsTo = user.phone;
      try {
        await sendSMS({ to: smsTo, message: smsMsg });
      } catch (smsErr) {
        console.error('❌ [OTP-SMS] Failed to send OTP SMS:', smsErr);
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();
        return res.status(500).json({ message: 'Unable to send OTP. Please try again.' });
      }
    } else {
      const emailSubject = `Secure Password Recovery Code - Shri Navrang Jewellers`;
      const emailText = `Your password reset OTP is ${otp}. It expires in 10 minutes.`;
      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #111111; color: #ffffff; border: 2px solid #D4AF37; border-radius: 8px; text-align: center;">
          <h2 style="font-family: 'Georgia', serif; font-size: 26px; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Shri Navrang Jewellers</h2>
          <p style="font-size: 14px; color: #aaaaaa; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 30px; font-weight: bold;">Purity • Trust • Perfection</p>
          <div style="border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 30px 0; margin-bottom: 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5; margin-bottom: 20px;">Dear Patron,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #e5e5e5; margin-bottom: 25px;">A secure request has been made to recover access to your luxury jewellery account. Please use the following 6-digit verification code to complete your reset:</p>
            <h1 style="font-family: monospace; font-size: 40px; color: #D4AF37; letter-spacing: 10px; margin: 0 0 15px 0; line-height: 1.2;">${otp}</h1>
            <p style="font-size: 12px; color: #888888; margin-top: 10px;">This code is strictly for <strong>one-time use</strong> only and will expire in <strong>10 minutes</strong>.</p>
          </div>
          <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 0;">If you did not make this request, please secure your account immediately. Daily Showroom Managed by Navrang Jangid & Family.</p>
        </div>
      `;
      try {
        await sendEmail({ to: user.email, subject: emailSubject, text: emailText, html: emailHtml });
      } catch (emailErr) {
        console.error('❌ [OTP-EMAIL] Failed to send OTP email via SMTP:', emailErr);
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();
        return res.status(500).json({ message: 'Unable to send OTP. Please try again.' });
      }
    }

    return res.json({ 
      message: `A secure 6-digit verification code has been dispatched. Please check your registered ${deliveryMethod === 'sms' ? 'mobile number' : 'email inbox'}.`
    });
  } catch (error) {
    console.error('Forgot password OTP generation crash:', error);
    return res.status(500).json({ message: 'Server recovery error', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;
  try {
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Please provide both identifier and OTP code' });
    }

    const searchStr = identifier.trim();
    let user;
    
    if (searchStr.includes('@')) {
      const sanitizedEmail = searchStr.toLowerCase();
      user = await User.findOne({ email: sanitizedEmail });
    } else {
      const digitsOnly = searchStr.replace(/\D/g, '');
      user = await User.findOne({ phone: digitsOnly });
      if (!user && digitsOnly.length >= 8) {
        const rawUsers = await User.find({});
        const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
        user = users.find(u => {
          if (!u.phone) return false;
          const uDigits = u.phone.replace(/\D/g, '');
          return uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits);
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp) {
      return res.status(400).json({ message: 'No active password recovery request found for this account.' });
    }

    // Check expiration
    if (new Date() > new Date(user.otpExpires)) {
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'The verification code has expired (valid for 10 minutes only). Please request a new code.' });
    }

    // Verify code match
    if (String(user.otp) !== String(otp).trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      
      // Repeated abuse protection: Max 5 failed attempts
      if (user.otpAttempts >= 5) {
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();
        return res.status(400).json({ message: 'Too many invalid OTP attempts. For security, this verification code has been revoked. Please request a new one.' });
      }

      await user.save();
      return res.status(400).json({ message: `Invalid verification code. You have ${5 - user.otpAttempts} attempt(s) remaining.` });
    }

    return res.json({ message: 'Verification successful! You may now create a new password.' });
  } catch (error) {
    console.error('Verify OTP crash:', error);
    return res.status(500).json({ message: 'Server verification error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { identifier, otp, password } = req.body;
  try {
    if (!identifier || !otp || !password) {
      return res.status(400).json({ message: 'Please provide all details: identifier, OTP, and new password' });
    }

    const searchStr = identifier.trim();
    let user;
    
    if (searchStr.includes('@')) {
      const sanitizedEmail = searchStr.toLowerCase();
      user = await User.findOne({ email: sanitizedEmail });
    } else {
      const digitsOnly = searchStr.replace(/\D/g, '');
      user = await User.findOne({ phone: digitsOnly });
      if (!user && digitsOnly.length >= 8) {
        const rawUsers = await User.find({});
        const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
        user = users.find(u => {
          if (!u.phone) return false;
          const uDigits = u.phone.replace(/\D/g, '');
          return uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits);
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp) {
      return res.status(400).json({ message: 'No active password recovery request found for this account.' });
    }

    // Check expiration
    if (new Date() > new Date(user.otpExpires)) {
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'The verification code has expired (valid for 10 minutes only). Please request a new code.' });
    }

    // Verify code match
    if (String(user.otp) !== String(otp).trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      
      // Repeated abuse protection: Max 5 failed attempts
      if (user.otpAttempts >= 5) {
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();
        return res.status(400).json({ message: 'Too many invalid OTP attempts. For security, this verification code has been revoked. Please request a new one.' });
      }

      await user.save();
      return res.status(400).json({ message: `Invalid verification code. You have ${5 - user.otpAttempts} attempt(s) remaining.` });
    }

    // OTP matches! Update password securely using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear OTP fields - one-time use verified!
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;

    await user.save();

    console.log(`✓ [OTP-SECURITY] Password updated successfully for user "${user.name}" <${user.email}>. OTP revoked.`);

    return res.json({ message: 'Your password has been successfully reset! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password crash:', error);
    return res.status(500).json({ message: 'Server reset error', error: error.message });
  }
};

const getCustomerNotifications = async (req, res) => {
  try {
    const rawNotifications = await Notification.find({ userId: String(req.user._id) });
    const notifications = Array.isArray(rawNotifications) ? rawNotifications : (rawNotifications.data || []);
    // Sort newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving notifications', error: error.message });
  }
};

const markCustomerNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (String(notification.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    notification.isRead = true;
    await notification.save();
    return res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    return res.status(500).json({ message: 'Server error marking notification as read', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getCustomerNotifications,
  markCustomerNotificationRead
};
