import Product from '../models/Product.js';
import PriceHistory from '../models/PriceHistory.js';
import { searchAndCompareProducts } from '../services/scraperService.js';
import { getRecommendedProducts } from '../services/geminiService.js';

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

// @desc    Get smart product recommendations for a product
// @route   GET /api/products/:id/recommendations
// @access  Public
export const getProductRecommendations = async (req, res, next) => {
  try {
    const targetProduct = await Product.findById(req.params.id);
    if (!targetProduct) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Get up to 10 potential matching candidates from the database (exclude current product)
    // Try to find items in same category first, fallback to any other product
    let candidates = await Product.find({
      _id: { $ne: targetProduct._id },
      category: targetProduct.category
    }).limit(10);

    if (candidates.length === 0) {
      candidates = await Product.find({
        _id: { $ne: targetProduct._id }
      }).limit(10);
    }

    if (candidates.length === 0) {
      return res.json({ success: true, count: 0, recommendations: [] });
    }

    // Call Gemini Service for recommendations
    let aiRecs = null;
    try {
      aiRecs = await getRecommendedProducts(targetProduct, candidates);
    } catch (err) {
      console.error('Gemini recommendation query failed, falling back to local reasoning:', err);
    }

    let recommendations = [];

    if (aiRecs && Array.isArray(aiRecs)) {
      // Build recommendation array by matching IDs returned from Gemini
      for (const rec of aiRecs) {
        const matchedProd = candidates.find(c => c._id.toString() === rec.id);
        if (matchedProd) {
          recommendations.push({
            product: matchedProd,
            reason: rec.reason
          });
        }
      }
    }

    // Local fallback if Gemini fails or is not configured
    if (recommendations.length === 0) {
      // Pick top 3 candidates sorted by rating/reviews or proximity in price
      const sortedCandidates = [...candidates].sort((a, b) => {
        // Sort by same brand first
        if (a.brand === targetProduct.brand && b.brand !== targetProduct.brand) return -1;
        if (b.brand === targetProduct.brand && a.brand !== targetProduct.brand) return 1;
        // Then by rating
        return b.rating - a.rating;
      }).slice(0, 3);

      recommendations = sortedCandidates.map(c => {
        let reason = '';
        if (c.brand === targetProduct.brand) {
          reason = `A premium model alternative from the same brand, ${c.brand}.`;
        } else if (c.lowestPrice < targetProduct.lowestPrice) {
          reason = `A more budget-friendly choice in the ${c.category} category.`;
        } else {
          reason = `Top-rated alternative with a customer score of ⭐ ${c.rating}/5.`;
        }
        return {
          product: c,
          reason
        };
      });
    }

    res.json({ success: true, count: recommendations.length, recommendations });
  } catch (error) {
    next(error);
  }
};
