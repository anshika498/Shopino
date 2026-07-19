import express from 'express';
import {
  getAlerts,
  createAlert,
  deleteAlert,
} from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require auth for all alert routes

router.route('/')
  .get(getAlerts)
  .post(createAlert);

router.route('/:id')
  .delete(deleteAlert);

export default router;
