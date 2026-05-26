const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, products: [] });
    }
    return res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ message: 'Server error retrieving cart', error: error.message });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  try {
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, products: [] });
    }

    const itemIdx = cart.products.findIndex(p => String(p.productId) === String(productId));

    if (itemIdx > -1) {
      cart.products[itemIdx].quantity += qty;
    } else {
      cart.products.push({ productId, quantity: qty });
    }

    await cart.save();
    return res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ message: 'Server error adding to cart', error: error.message });
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);

  try {
    if (!productId || qty === undefined || isNaN(qty)) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIdx = cart.products.findIndex(p => String(p.productId) === String(productId));
    if (itemIdx === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    if (qty <= 0) {
      cart.products.splice(itemIdx, 1);
    } else {
      cart.products[itemIdx].quantity = qty;
    }

    await cart.save();
    return res.json(cart);
  } catch (error) {
    console.error('Update quantity error:', error);
    return res.status(500).json({ message: 'Server error updating cart', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = cart.products.filter(p => String(p.productId) !== String(productId));
    await cart.save();
    
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'Server error removing product from cart', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart
};
