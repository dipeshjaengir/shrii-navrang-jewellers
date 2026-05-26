const Review = require('../models/Review');
const Product = require('../models/Product');

const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const rawReviews = await Review.find({ productId });
    const reviews = Array.isArray(rawReviews) ? rawReviews : (rawReviews.data || []);
    
    // Sort reviews (newest first)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving reviews', error: error.message });
  }
};

const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const ratingNum = parseInt(rating);

  try {
    if (!productId || !ratingNum || !comment) {
      return res.status(400).json({ message: 'All review fields (productId, rating, comment) are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ userId: req.user._id, productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const newReview = await Review.create({
      userId: req.user._id,
      productId,
      rating: ratingNum,
      comment
    });

    // Recalculate Product overall ratings
    const rawReviews = await Review.find({ productId });
    const allReviews = Array.isArray(rawReviews) ? rawReviews : (rawReviews.data || []);
    
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length) : ratingNum;

    product.ratings = parseFloat(avgRating.toFixed(1));
    product.reviewsCount = allReviews.length;
    await product.save();

    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Server error adding review', error: error.message });
  }
};

module.exports = {
  getProductReviews,
  createReview
};
