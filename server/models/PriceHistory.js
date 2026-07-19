import mongoose from 'mongoose';

const historyPointSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const priceHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    history: [historyPointSchema],
  },
  {
    timestamps: true,
  }
);

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);
export default PriceHistory;
