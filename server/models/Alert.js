import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    storeName: {
      type: String,
      default: 'Any', // 'Any' or specific store name like 'Amazon'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTriggered: {
      type: Boolean,
      default: false,
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
