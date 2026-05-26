const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

global.useJsonDb = false;

const connectDB = async () => {
  try {
    // Set a strict connection timeout of 3 seconds so we fall back quickly instead of hanging
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Shri_navrang_jewellers', {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✨ MongoDB Connected Successfully to Shri Navrang Jewellers!');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', err.message);
    console.warn('🔮 Activating local JSON-based database fallback for zero-dependency seamless execution!');
    global.useJsonDb = true;

    // Ensure backend/data folder exists for JSON storage files
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
};

module.exports = connectDB;
