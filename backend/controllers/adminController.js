const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// 1. Dashboard Analytics & Reports
const getAnalytics = async (req, res) => {
  try {
    const rawUsers = await User.find({});
    const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
    const customerCount = users.filter(u => u.role !== 'admin').length;

    const rawProducts = await Product.find({});
    const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts.data || []);
    const productCount = products.length;

    const rawOrders = await Order.find({});
    const orders = Array.isArray(rawOrders) ? rawOrders : (rawOrders.data || []);
    const orderCount = orders.length;

    // Calculate revenue
    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Identify low stock products (e.g. stock <= 5)
    const lowStockAlerts = products.filter(p => p.stock <= 5);

    // Sales by Category Report
    const categorySales = {};
    orders.forEach(order => {
      order.products.forEach(item => {
        const prod = products.find(p => String(p._id) === String(item.productId));
        if (prod) {
          categorySales[prod.category] = (categorySales[prod.category] || 0) + (item.price * item.quantity);
        }
      });
    });

    const categorySalesArr = Object.keys(categorySales).map(cat => ({
      category: cat,
      sales: categorySales[cat]
    }));

    return res.json({
      summary: {
        totalUsers: customerCount,
        totalProducts: productCount,
        totalOrders: orderCount,
        totalRevenue: revenue,
        lowStockCount: lowStockAlerts.length
      },
      lowStockAlerts: lowStockAlerts.map(p => ({
        _id: p._id,
        productName: p.productName,
        stock: p.stock,
        price: p.price
      })),
      categorySales: categorySalesArr
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return res.status(500).json({ message: 'Server error generating analytics', error: error.message });
  }
};

// 2. Order Management
const getAllOrders = async (req, res) => {
  try {
    const rawOrders = await Order.find({});
    const orders = Array.isArray(rawOrders) ? rawOrders : (rawOrders.data || []);
    // Sort by newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  try {
    if (!['Processing', 'Packed', 'Shipped', 'Delivered'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.json({ message: `Order status updated to ${orderStatus}`, order });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating order status', error: error.message });
  }
};

// 3. User Management
const getAllUsers = async (req, res) => {
  try {
    const rawUsers = await User.find({});
    const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
    const customersOnly = users.filter(u => u.role !== 'admin');
    
    // Strip passwords for safety
    const stripped = customersOnly.map(u => {
      const uCopy = { ...u };
      delete uCopy.password;
      return uCopy;
    });

    return res.json(stripped);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an administrator account' });
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: 'User successfully removed from system' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error removing user', error: error.message });
  }
};

// 4. Product Management CRUD
const addProduct = async (req, res) => {
  const { productName, category, price, description, images, stock, material, weight, gender } = req.body;

  try {
    if (!productName || !category || !price || !description || !images || !material || !weight) {
      return res.status(400).json({ message: 'Please provide all required product details' });
    }

    const product = await Product.create({
      productName,
      category,
      price: parseFloat(price),
      description,
      images: Array.isArray(images) ? images : [images],
      stock: parseInt(stock) || 0,
      material,
      weight,
      gender: gender || 'Women',
      ratings: 4.5,
      reviewsCount: 0
    });

    return res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(500).json({ message: 'Server error adding product', error: error.message });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.images && !Array.isArray(updateData.images)) {
      updateData.images = [updateData.images];
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    return res.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(id);
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
};

module.exports = {
  getAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteUser,
  addProduct,
  editProduct,
  deleteProduct
};
