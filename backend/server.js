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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

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

  // Auto-seed if the database (MongoDB or JSON) contains no products!
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🔮 Empty database detected. Auto-seeding premium jewelry items...');
      const seedData = require('./scripts/seed');
      await seedData();
    }
  } catch (seedErr) {
    console.error('⚠️ Auto-seeding failed:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`✨ Shrii Navrang Jewellers server is gleaming beautifully on port ${PORT}!`);
    console.log(`🔗 API Health URL: http://localhost:${PORT}/api/health`);
    if (global.useJsonDb) {
      console.log('📂 Local JSON file-based database active in backend/data/');
    }
  });
};

startServer().catch(err => {
  console.error('❌ Server startup failure:', err);
});
