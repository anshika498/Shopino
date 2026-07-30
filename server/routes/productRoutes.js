import express from 'express';
import {
  searchProducts,
  getProductById,
  getProductPriceHistory,
  getDeals,
  getTrending,
  deleteProduct,
  getProductRecommendations,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/deals/trending', getDeals);
router.get('/trending/list', getTrending);
router.get('/:id', getProductById);
router.get('/:id/history', getProductPriceHistory);
router.get('/:id/recommendations', getProductRecommendations);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
