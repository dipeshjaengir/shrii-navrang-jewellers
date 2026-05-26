const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Custom File Logging Instrumentation
const logFile = path.join(__dirname, '../seed_debug.log');
fs.writeFileSync(logFile, '--- Shrii Navrang Jewellers Seed Log ---\n');
const originalLog = console.log;
const originalError = console.error;
console.log = function(...args) {
  fs.appendFileSync(logFile, args.join(' ') + '\n');
  originalLog.apply(console, args);
};
console.error = function(...args) {
  fs.appendFileSync(logFile, 'ERROR: ' + args.join(' ') + '\n');
  originalError.apply(console, args);
};

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const productsData = [
  {
    productName: "Aditi Gold Temple Choker Necklace",
    category: "Necklaces",
    price: 185000,
    description: "Exquisite 22-karat gold choker necklace featuring antique temple patterns of Goddess Lakshmi, adorned with premium ruby drops. Crafted by master Indian goldsmiths.",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 8,
    material: "Gold",
    weight: "28.4g",
    gender: "Women",
    ratings: 4.9,
    reviewsCount: 3
  },
  {
    productName: "Aria Princess Diamond Ring",
    category: "Rings",
    price: 125000,
    description: "Vibrant solitaire diamond engagement ring crafted in 18-karat white gold. A timeless representation of everlasting promise and clean luxury.",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 15,
    material: "Diamond",
    weight: "3.8g",
    gender: "Women",
    ratings: 4.8,
    reviewsCount: 5
  },
  {
    productName: "Navrang Royal Bridal Polki Set",
    category: "Bridal Collection",
    price: 420000,
    description: "Masterfully hand-cut Polki choker accompanied by matching dangling earrings. The ultimate embodiment of Indian royal heritage and bridal legacy.",
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 3,
    material: "Gold",
    weight: "72.6g",
    gender: "Women",
    ratings: 5.0,
    reviewsCount: 2
  },
  {
    productName: "Classic Gold Filigree Jhumkas",
    category: "Earrings",
    price: 65000,
    description: "Delicate traditional gold jhumka earrings featuring intricate filigree work and suspended seed pearl drops. Ideal for heritage wear.",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 25,
    material: "Gold",
    weight: "14.2g",
    gender: "Women",
    ratings: 4.7,
    reviewsCount: 8
  },
  {
    productName: "Kundan Emerald Kada Bangles",
    category: "Bangles",
    price: 210000,
    description: "Set of two stunning 22k gold Kada bangles, embellished with pure Kundan settings and vivid green hand-cut emeralds.",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 6,
    material: "Gold",
    weight: "38.5g",
    gender: "Women",
    ratings: 4.9,
    reviewsCount: 4
  },
  {
    productName: "The Emperor Diamond Band for Men",
    category: "Men's Collection",
    price: 98000,
    description: "Sleek, bold men's platinum wedding band featuring a flush-set row of brilliant round-cut diamonds. Minimalist luxury at its finest.",
    images: [
      "https://images.unsplash.com/photo-1615655404740-8f030d678890?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 10,
    material: "Diamond",
    weight: "8.2g",
    gender: "Men",
    ratings: 4.6,
    reviewsCount: 6
  },
  {
    productName: "Divine Silver Anklets Pair",
    category: "Silver Jewellery",
    price: 15000,
    description: "Traditional 925 sterling silver anklets showcasing hand-carved floral patterns and soft-tinkling bells. Creates a beautiful aura.",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 30,
    material: "Silver",
    weight: "45.0g",
    gender: "Women",
    ratings: 4.5,
    reviewsCount: 9
  },
  {
    productName: "Majestic Peacock Gold Pendant",
    category: "Necklaces",
    price: 48000,
    description: "Finely detailed peacock shaped pendant crafted in glowing 22-karat yellow gold and set with ruby cabochons.",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 18,
    material: "Gold",
    weight: "7.8g",
    gender: "Women",
    ratings: 4.7,
    reviewsCount: 4
  },
  {
    productName: "Minimalist Silver Sleek Bracelet",
    category: "Silver Jewellery",
    price: 8500,
    description: "Modern 925 silver slider bracelet with geometric diamond-cut silver charms. Elegant, premium daily wear luxury.",
    images: [
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 40,
    material: "Silver",
    weight: "12.0g",
    gender: "Women",
    ratings: 4.4,
    reviewsCount: 11
  },
  {
    productName: "Infinity Diamond Stud Earrings",
    category: "Earrings",
    price: 145000,
    description: "Brilliant-cut pair of diamond studs featuring an infinity loop basket design, set in high-polish 18k yellow gold.",
    images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 12,
    material: "Diamond",
    weight: "2.5g",
    gender: "Women",
    ratings: 4.8,
    reviewsCount: 7
  }
];

const seedData = async () => {
  // Connect to DB (MongoDB or sets global.useJsonDb = true)
  await connectDB();

  console.log('🔄 Cleaning existing collections...');
  
  if (global.useJsonDb) {
    // Overwrite JSON files with empty arrays to clear them
    const dataDir = path.join(__dirname, '../data');
    fs.writeFileSync(path.join(dataDir, 'User.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(dataDir, 'Product.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(dataDir, 'Cart.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(dataDir, 'Order.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(dataDir, 'Review.json'), JSON.stringify([], null, 2));
    fs.writeFileSync(path.join(dataDir, 'Notification.json'), JSON.stringify([], null, 2));
  } else {
    // Mongoose clear
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
  }

  console.log('💎 Seeding products...');
  const seededProducts = [];
  for (let prod of productsData) {
    const newProd = await Product.create(prod);
    seededProducts.push(newProd);
  }
  console.log(`✅ Seeded ${seededProducts.length} premium jewellery products!`);

  console.log('👥 Seeding default users...');
  
  // Hashed Passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('adminpassword123', salt);
  const customerPassword = await bcrypt.hash('customerpassword123', salt);

  // 1. Seed Admin Account
  const adminUser = await User.create({
    name: "Navrang Shrinath (Admin)",
    email: "admin@shriinavrang.com",
    phone: "+91 98765 43210",
    password: adminPassword,
    role: "admin",
    addresses: [],
    wishlist: []
  });
  // Empty cart for admin
  await Cart.create({
    userId: adminUser._id,
    products: []
  });

  // 2. Seed Customer Account
  const customerUser = await User.create({
    name: "Dipesh Sharma",
    email: "customer@shriinavrang.com",
    phone: "+91 99887 76655",
    password: customerPassword,
    role: "customer",
    addresses: [
      {
        street: "12, Gold Souk Mall, Sector 43",
        city: "Gurugram",
        state: "Haryana",
        zip: "122002",
        country: "India",
        isDefault: true
      }
    ],
    wishlist: [seededProducts[0]._id, seededProducts[1]._id] // pre-fill wishlist
  });
  
  // Initialize customer cart with 1 default item
  await Cart.create({
    userId: customerUser._id,
    products: [
      {
        productId: seededProducts[3]._id, // Filigree Jhumkas
        quantity: 1
      }
    ]
  });

  // Seed sample reviews for products
  console.log('⭐ Seeding customer reviews...');
  
  // Review 1
  const rev1 = await Review.create({
    userId: customerUser._id,
    productId: seededProducts[0]._id,
    rating: 5,
    comment: "This Aditi Choker is breathtakingly gorgeous! The 22k gold glows warmly and the craftsmanship details are top notch. Worth every single rupee!"
  });
  
  // Review 2
  const rev2 = await Review.create({
    userId: customerUser._id,
    productId: seededProducts[1]._id,
    rating: 4,
    comment: "A beautiful solitaire diamond. Clean cut, high clarity. The packaging from Shrii Navrang Jewellers felt so premium."
  });

  // Seed sample notification for customer
  await Notification.create({
    userId: customerUser._id,
    title: "Welcome to Shrii Navrang Jewellers! 🌟",
    message: "Thank you for registering. Discover our premium hand-crafted gold and diamond collections inspired by Indian heritage."
  });

  console.log('🎉 Seeding successfully completed!');
  console.log('\n🔐 DEFAULT USER CREDENTIALS FOR TESTING:');
  console.log('--------------------------------------------------');
  console.log('👤 CUSTOMER LOGIN:');
  console.log('   Email:    customer@shriinavrang.com');
  console.log('   Password: customerpassword123');
  console.log('--------------------------------------------------');
  console.log('🔑 ADMIN LOGIN:');
  console.log('   Email:    admin@shriinavrang.com');
  console.log('   Password: adminpassword123');
  console.log('--------------------------------------------------\n');

  if (!global.useJsonDb) {
    process.exit(0);
  }
};

// If run directly
if (require.main === module) {
  seedData()
    .then(() => {
      if (global.useJsonDb) {
        console.log('JSON file database seeded. Safe to terminate.');
      }
    })
    .catch(err => {
      console.error('Fatal Seeding Error:', err);
      process.exit(1);
    });
}

module.exports = seedData;
