import Product from '../models/Product.js';
import PriceHistory from '../models/PriceHistory.js';
import { searchAndCompareProducts } from '../services/scraperService.js';

// @desc    Search and compare products across stores
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res, next) => {
  const query = req.query.q;

  try {
    if (!query) {
      res.status(400);
      throw new Error('Please provide a search keyword');
    }

    const products = await searchAndCompareProducts(query);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get price history for a product
// @route   GET /api/products/:id/history
// @access  Public
export const getProductPriceHistory = async (req, res, next) => {
  try {
    const history = await PriceHistory.find({ productId: req.params.id });
    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best deals (high discounts)
// @route   GET /api/products/deals/trending
// @access  Public
export const getDeals = async (req, res, next) => {
  try {
    const category = req.query.category;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    
    // Find products with listings offering substantial discount (>15%)
    // Sort by lowest price or discount percentage
    const products = await Product.find({
      'listings.discountPercentage': { $gte: 15 }
    })
      .limit(10);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending/list
// @access  Public
export const getTrending = async (req, res, next) => {
  try {
    // Return products with highest reviews count / ratings
    const products = await Product.find({})
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(6);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      await PriceHistory.deleteMany({ productId: req.params.id });
      res.json({ success: true, message: 'Product and history deleted' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};
