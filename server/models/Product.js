import mongoose from 'mongoose';

const storeListingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
    default: '',
  },
  cashback: {
    type: String,
    default: '',
  },
  deliveryCharges: {
    type: Number,
    default: 0,
  },
  deliveryTime: {
    type: String,
    default: '3-5 days',
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  sellerRating: {
    type: Number,
    default: 0,
  },
  warranty: {
    type: String,
    default: '1 Year Manufacturer Warranty',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  emiOptions: {
    type: String,
    default: 'No Cost EMI available',
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      required: true,
      index: true,
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    listings: [storeListingSchema],
    lowestPrice: {
      type: Number,
      index: true,
    },
    bestRatedStore: String,
    fastestDeliveryStore: String,
    bestOverallDealStore: String,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate summary values (lowest price, best rated, etc.)
productSchema.pre('save', function (next) {
  if (this.listings && this.listings.length > 0) {
    // 1. Lowest Price
    const prices = this.listings.map((l) => l.price);
    this.lowestPrice = Math.min(...prices);

    // 2. Best Rated Store
    let bestStore = this.listings[0];
    for (let i = 1; i < this.listings.length; i++) {
      if (this.listings[i].rating > bestStore.rating) {
        bestStore = this.listings[i];
      }
    }
    this.bestRatedStore = bestStore.storeName;

    // 3. Fastest Delivery Store (parse days, lowest days win)
    let minDays = Infinity;
    let fastestStore = this.listings[0].storeName;
    this.listings.forEach((l) => {
      const match = l.deliveryTime.match(/(\d+)/);
      const days = match ? parseInt(match[0], 10) : 7;
      if (days < minDays) {
        minDays = days;
        fastestStore = l.storeName;
      }
    });
    this.fastestDeliveryStore = fastestStore;

    // 4. Best Overall Deal (simple composite metric: price weight + rating weight)
    // Lower price score (normalized) + higher rating score. Let's find one with minimum price first, or best price/rating ratio
    let bestDealStore = this.listings[0].storeName;
    let bestScore = -Infinity;
    this.listings.forEach((l) => {
      // Score = (100000 / Price) * 0.7 + (Rating * 100) * 0.3
      const score = (100000 / (l.price || 1)) * 0.7 + (l.rating || 0) * 100 * 0.3;
      if (score > bestScore) {
        bestScore = score;
        bestDealStore = l.storeName;
      }
    });
    this.bestOverallDealStore = bestDealStore;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
