import Wishlist from '../models/Wishlist.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id }).populate('productId');
    // Filter out items where product might have been deleted
    const validItems = items.filter(item => item.productId !== null);
    res.json({ success: true, count: validItems.length, wishlist: validItems });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    // Check if already in wishlist
    const exists = await Wishlist.findOne({ userId: req.user._id, productId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    const item = await Wishlist.create({
      userId: req.user._id,
      productId,
    });

    const populated = await item.populate('productId');

    res.status(201).json({ success: true, wishlist: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({
      userId: req.user._id,
      productId: req.params.productId,
    });

    if (item) {
      await Wishlist.findByIdAndDelete(item._id);
      res.json({ success: true, message: 'Product removed from wishlist' });
    } else {
      res.status(404);
      throw new Error('Product not found in wishlist');
    }
  } catch (error) {
    next(error);
  }
};
