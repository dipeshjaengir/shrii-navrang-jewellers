const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'] : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic Route Import
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ratesRoutes = require('./routes/ratesRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rates', ratesRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: global.useJsonDb ? 'JSON File-Based Fallback DB' : 'MongoDB Connection Active',
    timestamp: new Date().toISOString()
  });
});

// Port setting
const PORT = process.env.PORT || 5000;

// Initialize Server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Self-Healing Admin Account Verification & Creation Block
  try {
    const User = require('./models/User');
    const Cart = require('./models/Cart');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    const adminEmail = 'admin@shrinavrang.com';
    const adminPasswordPlain = 'adminpassword123';

    console.log(`🔍 [SELF-HEALING] Checking admin account status for email: "${adminEmail}"...`);

    // Find admin user case-insensitively / normalized
    let adminUser = await User.findOne({ email: adminEmail });

    // Fallback: search by uppercase or un-normalized if MongoDB case-insensitive index isn't used
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@Shrinavrang.com' });
    }

    if (!adminUser) {
      console.log(`🚨 [SELF-HEALING] Admin account not found in database. Seeding default admin...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPasswordPlain, salt);
      
      adminUser = await User.create({
        name: "Navrang Shrinath (Admin)",
        email: adminEmail,
        phone: "+91 98765 43210",
        password: hashedPassword,
        role: "admin",
        addresses: [],
        wishlist: []
      });

      // Ensure empty cart exists for admin
      const existingCart = await Cart.findOne({ userId: adminUser._id });
      if (!existingCart) {
        await Cart.create({
          userId: adminUser._id,
          products: []
        });
      }
      console.log(`✅ [SELF-HEALING] Default admin created successfully!`);
    } else {
      console.log(`✓ [SELF-HEALING] Admin account found in database: "${adminUser.name}" <${adminUser.email}>`);
      
      let needsSave = false;

      // 1. Ensure email is strictly lowercase and trimmed
      if (adminUser.email !== adminUser.email.trim().toLowerCase()) {
        console.log(`⚠️ [SELF-HEALING] Admin email is not normalized. Normalizing "${adminUser.email}" to "${adminUser.email.trim().toLowerCase()}"...`);
        adminUser.email = adminUser.email.trim().toLowerCase();
        needsSave = true;
      }

      // 2. Ensure role is admin
      if (adminUser.role !== 'admin') {
        console.log(`⚠️ [SELF-HEALING] Admin user role is "${adminUser.role}". Elevating to "admin"...`);
        adminUser.role = 'admin';
        needsSave = true;
      }

      // 3. Ensure password is correctly hashed with bcrypt (if it starts with $2a$ it's probably hashed, but let's compare with password)
      const isCorrectPassword = await bcrypt.compare(adminPasswordPlain, adminUser.password);
      if (!isCorrectPassword) {
        console.log(`⚠️ [SELF-HEALING] Admin password verification failed. Resetting to default secure password...`);
        const salt = await bcrypt.genSalt(10);
        adminUser.password = await bcrypt.hash(adminPasswordPlain, salt);
        needsSave = true;
      }

      if (needsSave) {
        await adminUser.save();
        console.log(`✅ [SELF-HEALING] Admin account normalization and self-healing complete!`);
      } else {
        console.log(`✓ [SELF-HEALING] Admin account is fully healthy and verified!`);
      }
    }

    // --- AUTOMATIC INTERNAL VERIFICATION TEST SUITE ---
    console.log(`🧪 [TEST SUITE] Initiating internal end-to-end credential verification...`);
    console.log(`DB Mode: ${global.useJsonDb ? 'JSON FILE FALLBACK' : 'MONGODB ACTIVE'}`);

    const testUser = await User.findOne({ email: adminEmail });
    if (!testUser) {
      throw new Error(`❌ [TEST FAIL] Admin user not found via User.findOne({ email: "${adminEmail}" })!`);
    }
    console.log(`✓ [TEST] User.findOne successfully matched admin by lowercase email.`);

    const isMatch = await bcrypt.compare(adminPasswordPlain, testUser.password);
    if (!isMatch) {
      throw new Error(`❌ [TEST FAIL] Password bcrypt match failed for "${adminEmail}"!`);
    }
    console.log(`✓ [TEST] Password successfully verified with bcrypt comparison.`);

    if (testUser.role !== 'admin') {
      throw new Error(`❌ [TEST FAIL] Admin user does not have the "admin" role! Found: "${testUser.role}"`);
    }
    console.log(`✓ [TEST] Role successfully validated as "admin".`);

    // Verify JWT Generation
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'Shri_navrang_jewellers_secret_key_12345_luxury_brand_2026', {
      expiresIn: '30d'
    });
    if (!token) {
      throw new Error(`❌ [TEST FAIL] JWT generation returned empty token!`);
    }
    console.log(`✓ [TEST] JWT generated successfully: "${token.substring(0, 20)}..."`);

    // Verify token decoding
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Shri_navrang_jewellers_secret_key_12345_luxury_brand_2026');
    if (String(decoded.id) !== String(testUser._id)) {
      throw new Error(`❌ [TEST FAIL] Decoded JWT ID (${decoded.id}) does not match admin user ID (${testUser._id})!`);
    }
    console.log(`✓ [TEST] JWT signature and payload verified successfully.`);

    console.log(`✨ [TEST PASS] END-TO-END ADMIN LOGIN CREDENTIALS VERIFIED SUCCESSFULLY IN ${global.useJsonDb ? 'JSON' : 'MONGO'} MODE!`);
  } catch (err) {
    console.error(`❌ [SELF-HEALING ERROR] Failed to heal or verify admin credentials:`, err.message);
  }

  // Auto-seed if the database (MongoDB or JSON) contains no products!
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🔮 Empty database detected. Auto-seeding premium jewelry items...');
      const seedData = require('./scripts/seed');
      await seedData();
    }

    // Auto-seed rates and config if empty
    const Rates = require('./models/Rates');
    const ratesCount = await Rates.countDocuments();
    if (ratesCount === 0) {
      console.log('📈 Seeding default market rates for Gold and Silver...');
      await Rates.create({
        gold24k: 7250,
        gold22k: 6650,
        silver: 90,
        businessEmail: 'info@shrinavrang.com'
      });
    }
  } catch (seedErr) {
    console.error('⚠️ Auto-seeding failed:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`✨ Shri Navrang Jewellers server is gleaming beautifully on port ${PORT}!`);
    console.log(`🔗 API Health URL: http://localhost:${PORT}/api/health`);
    if (global.useJsonDb) {
      console.log('📂 Local JSON file-based database active in backend/data/');
    }
  });
};

startServer().catch(err => {
  console.error('❌ Server startup failure:', err);
});
