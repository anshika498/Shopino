import Alert from '../models/Alert.js';

// @desc    Get user active price alerts
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).populate('productId');
    const validAlerts = alerts.filter(alert => alert.productId !== null);
    res.json({ success: true, count: validAlerts.length, alerts: validAlerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create price drop alert
// @route   POST /api/alerts
// @access  Private
export const createAlert = async (req, res, next) => {
  const { productId, targetPrice, storeName } = req.body;

  try {
    if (!productId || !targetPrice) {
      res.status(400);
      throw new Error('Please provide Product ID and Target Price');
    }

    // Check if alert for product already exists (update if so, or throw)
    let alert = await Alert.findOne({ userId: req.user._id, productId });
    
    if (alert) {
      alert.targetPrice = targetPrice;
      alert.storeName = storeName || 'Any';
      alert.isTriggered = false; // Reset trigger state if price updated
      await alert.save();
    } else {
      alert = await Alert.create({
        userId: req.user._id,
        productId,
        targetPrice,
        storeName: storeName || 'Any'
      });
    }

    const populated = await alert.populate('productId');
    res.status(201).json({ success: true, alert: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete price alert
// @route   DELETE /api/alerts/:id
// @access  Private
export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      userId: req.user._id,
      _id: req.params.id,
    });

    if (alert) {
      await Alert.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Price drop alert removed' });
    } else {
      res.status(404);
      throw new Error('Price alert not found');
    }
  } catch (error) {
    next(error);
  }
};
