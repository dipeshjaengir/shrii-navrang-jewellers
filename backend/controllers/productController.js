const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    // Retrieve all products (handles both DB structures)
    const rawProducts = await Product.find({});
    
    // Extracted array of products
    let products = Array.isArray(rawProducts) ? rawProducts : (rawProducts.data || []);

    // Apply Filters manually in Javascript to ensure identical performance on MongoDB and JSON files
    const { search, category, material, gender, priceMin, priceMax, rating, sort } = req.query;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      products = products.filter(p => searchRegex.test(p.productName) || searchRegex.test(p.description));
    }

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (material) {
      products = products.filter(p => p.material.toLowerCase() === material.toLowerCase());
    }

    if (gender) {
      products = products.filter(p => p.gender.toLowerCase() === gender.toLowerCase());
    }

    if (priceMin) {
      products = products.filter(p => p.price >= parseFloat(priceMin));
    }

    if (priceMax) {
      products = products.filter(p => p.price <= parseFloat(priceMax));
    }

    if (rating) {
      products = products.filter(p => p.ratings >= parseFloat(rating));
    }

    // Apply Sorting
    if (sort) {
      if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.ratings - a.ratings);
      } else if (sort === 'latest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        // default sorting (popularity / stock)
        products.sort((a, b) => b.stock - a.stock);
      }
    }

    return res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ message: 'Server error retrieving products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving product details', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById
};
