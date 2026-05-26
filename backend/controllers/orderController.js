const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const placeOrder = async (req, res) => {
  const { products, address, paymentDetails, totalPrice } = req.body;

  try {
    if (!products || products.length === 0 || !address || !totalPrice) {
      return res.status(400).json({ message: 'Order details are incomplete' });
    }

    // 1. Double check and decrement stock for each product
    for (let item of products) {
      const dbProd = await Product.findById(item.productId);
      if (!dbProd) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      if (dbProd.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${dbProd.productName}. Only ${dbProd.stock} left.` });
      }
      
      // Update product stock
      dbProd.stock -= item.quantity;
      await dbProd.save();
    }

    // 2. Create the Order
    const newOrder = await Order.create({
      userId: req.user._id,
      products,
      paymentDetails: {
        status: paymentDetails?.status || 'Paid',
        paymentMethod: paymentDetails?.paymentMethod || 'Card',
        transactionId: paymentDetails?.transactionId || 'TXN_' + Math.random().toString(36).substring(2, 11).toUpperCase()
      },
      address,
      totalPrice,
      orderStatus: 'Processing'
    });

    // 3. Clear user's Cart
    let userCart = await Cart.findOne({ userId: req.user._id });
    if (userCart) {
      userCart.products = [];
      await userCart.save();
    }

    // 4. Trigger order notification for customer
    await Notification.create({
      userId: req.user._id,
      title: 'Order Placed successfully! ✨',
      message: `Your order of ₹${totalPrice.toLocaleString('en-IN')} has been placed. Order ID: ${newOrder._id}. Our master artisans are preparing your jewelry!`
    });

    // 5. Trigger real-time order notification for Store Administrators
    await Notification.create({
      userId: 'admin',
      title: 'New Luxury Order Placed! 💎',
      message: `Customer "${req.user.name}" (${req.user.phone || 'N/A'}) placed an order of ₹${totalPrice.toLocaleString('en-IN')} for ${products.length} item(s). Order ID: #${newOrder._id.substring(newOrder._id.length - 8).toUpperCase()}`
    });

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ message: 'Server error placing order', error: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    // Sort in reverse order manually to ensure descending order on both DB adapters
    const list = Array.isArray(orders) ? orders : (orders.data || []);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving order history', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Ensure customers can only see their own orders (admins can see any)
    if (String(order.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving order details', error: error.message });
  }
};

module.exports = {
  placeOrder,
  getOrderHistory,
  getOrderById
};
