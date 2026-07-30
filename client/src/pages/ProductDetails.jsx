import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Star, 
  Heart, 
  Layers, 
  Bell, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  X,
  ThumbsUp,
  ThumbsDown,
  Activity
} from 'lucide-react';
import ComparisonTable from '../components/ComparisonTable.jsx';
import PriceChart from '../components/PriceChart.jsx';
import AlertModal from '../components/AlertModal.jsx';
import { addToComparison, removeFromComparison, toggleAIAssistant } from '../store/slices/uiSlice.js';
import API from '../utils/api.js';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { comparisonProducts } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  // 1. Fetch Product details and price history
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      const [prodRes, histRes] = await Promise.all([
        API.get(`/products/${id}`),
        API.get(`/products/${id}/history`)
      ]);

      if (prodRes.data.success) {
        setProduct(prodRes.data.product);
      }
      if (histRes.data.success) {
        setHistory(histRes.data.history);
      }

      // Check if user has this item wishlisted
      if (isAuthenticated) {
        const wishRes = await API.get('/wishlist');
        if (wishRes.data.success) {
          const isSaved = wishRes.data.wishlist.some(w => w.productId?._id === id);
          setIsWishlisted(isSaved);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const res = await API.get(`/products/${id}/recommendations`);
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchRecommendations();
    }
  }, [id, isAuthenticated]);

  const isInComparison = comparisonProducts.some((p) => p._id === id);

  const handleCompareClick = () => {
    if (isInComparison) {
      dispatch(removeFromComparison(id));
    } else {
      if (comparisonProducts.length >= 3) {
        alert('You can compare a maximum of 3 products in the matrix.');
        return;
      }
      dispatch(addToComparison(product));
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
      } else {
        await API.post('/wishlist', { productId: id });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/" className="mt-4 inline-block text-brand-primary font-bold">Go Home</Link>
      </div>
    );
  }

  // Pre-calculate lowest price deal
  const bestOffer = [...product.listings].sort((a, b) => a.price - b.price)[0];
  const specsObj = product.specs instanceof Map ? Object.fromEntries(product.specs) : product.specs || {};

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-10">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={12} />
          <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate(`/search?q=${product.category}`)}>{product.category}</span>
          <ChevronRight size={12} />
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Hero row: Image + Quick Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Product Image Panel */}
        <div className="rounded-3xl glass-card border overflow-hidden p-6 relative">
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'} 
            alt={product.name} 
            className="w-full h-80 sm:h-96 object-contain rounded-2xl"
          />
          
          {/* Action pills inside image */}
          <div className="absolute top-10 left-10 flex flex-col gap-2">
            <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
              {product.brand}
            </span>
          </div>

          <div className="absolute top-10 right-10 flex gap-2">
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-full backdrop-blur-md shadow-md border cursor-pointer transition-all ${
                isWishlisted
                  ? 'bg-rose-505 bg-rose-500 border-rose-500 text-white'
                  : 'bg-white/80 border-slate-200 text-slate-500 hover:text-rose-500 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-400 dark:hover:text-rose-450'
              }`}
              title={isWishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
            >
              <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Right Side: Quick specifications, Lowest price summary, Actions */}
        <div className="space-y-6">
          
          {/* Rating and Reviews */}
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded text-xs">
              <Star size={12} className="fill-current" />
              {product.rating}
            </span>
            <span className="text-xs text-slate-400 font-medium">({product.reviewsCount?.toLocaleString()} reviews count across stores)</span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display text-slate-800 dark:text-slate-100">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-450 leading-relaxed">{product.description}</p>
          </div>

          {/* Lowest Price Banner */}
          <div className="rounded-3xl glass-card border p-6 bg-gradient-to-tr from-brand-primary/5 to-rose-500/5">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Best Aggregated Deal</p>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl font-black text-slate-850 dark:text-white">
                ₹{bestOffer.price.toLocaleString()}
              </span>
              <span className="text-sm line-through text-slate-400">
                ₹{bestOffer.originalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                Save {bestOffer.discountPercentage}%
              </span>
            </div>

            <p className="text-xs text-slate-400 font-semibold mt-2">
              Available at <strong className="font-extrabold text-slate-700 dark:text-slate-300">{bestOffer.storeName}</strong> for ₹{bestOffer.price.toLocaleString()} (incl. {bestOffer.deliveryCharges === 0 ? 'Free Shipping' : `₹${bestOffer.deliveryCharges} delivery`}).
            </p>

            {/* Quick Action triggers */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              
              <button
                onClick={() => setIsAlertOpen(true)}
                className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-all cursor-pointer shadow-sm"
              >
                <Bell size={14} className="text-brand-primary" />
                Price Drop Alert
              </button>

              <button
                onClick={handleCompareClick}
                className={`flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-2xl border transition-all cursor-pointer shadow-sm ${
                  isInComparison
                    ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Layers size={14} />
                {isInComparison ? 'Added to Compare' : 'Add to Compare'}
              </button>

            </div>
          </div>

          {/* Quick Specifications Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Specifications</h3>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 p-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                {Object.entries(specsObj).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/30">
                    <dt className="text-slate-400 font-medium">{key}</dt>
                    <dd className="text-slate-750 dark:text-slate-200 font-extrabold text-right ml-4">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

        </div>

      </div>

      {/* Row 2: Comprehensive Deals Table */}
      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-black font-display text-slate-800 dark:text-slate-100">
          Compare Prices Across Stores
        </h2>
        <ComparisonTable product={product} />
      </section>

      {/* Row 3: Price fluctuation history chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts chart on left */}
        <div className="lg:col-span-2 rounded-3xl border p-6 glass-card">
          <PriceChart historyData={history} />
        </div>

        {/* AI Shopping assistant call-to-action details on right */}
        <div className="lg:col-span-1 rounded-3xl border p-6 glass-card flex flex-col justify-between bg-gradient-to-tr from-brand-primary/10 to-indigo-500/10">
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-brand-primary/20 text-brand-primary uppercase tracking-wider">
              <Sparkles size={12} className="animate-spin-slow" /> AI Insights
            </span>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Should you wait or buy now?</h3>
            <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-350">
              Our AI evaluates price variance over the last 90 days. Get customized advice on whether coupon codes are available and if prices are predicted to slide further.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-primary/10">
            <button
              onClick={() => dispatch(toggleAIAssistant(true))}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Ask AI Shopping Advisor
              <Sparkles size={14} />
            </button>
          </div>
        </div>

      </section>

      {/* Row 4: Customer Sentiment Summarizer */}
      <section className="rounded-3xl border glass-card p-6 space-y-6">
        <div>
          <h2 className="text-lg md:text-xl font-black font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="text-brand-primary" size={20} />
            Customer Sentiment Analysis
          </h2>
          <p className="text-xs text-slate-400 font-semibold">AI-aggregated Pros & Cons from customer reviews across all major stores</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros list */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/15 space-y-3">
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <ThumbsUp size={14} /> Key Pros (Aggregated)
            </h4>
            <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Exceptional build quality and premium aesthetics matching the brand.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Value for money deals available on {product.bestOverallDealStore} with instant cashbacks.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Fast and prompt shipping is consistently reported across {product.fastestDeliveryStore}.</span>
              </li>
            </ul>
          </div>

          {/* Cons list */}
          <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/5 border border-rose-500/15 space-y-3">
            <h4 className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <ThumbsDown size={14} /> Key Cons (Aggregated)
            </h4>
            <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <X size={14} className="text-rose-500 mt-0.5 shrink-0" />
                <span>Minor price variations between platforms cause shopping confusion.</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={14} className="text-rose-500 mt-0.5 shrink-0" />
                <span>Warranty handling requires standard registration process.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Row 5: AI Recommendations */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg md:text-xl font-black font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="text-brand-primary" size={20} />
            Smart Product Alternatives
          </h2>
          <p className="text-xs text-slate-400 font-semibold">AI-recommended complementary or alternative choices from our catalog</p>
        </div>

        {recommendationsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card border border-slate-200/40 dark:border-slate-800/40 rounded-3xl p-5 h-72 animate-pulse bg-slate-800/5 dark:bg-slate-800/10" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/5 dark:bg-slate-900/5">
            <p className="text-xs text-slate-450">No recommendations found for this product category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(({ product: recProd, reason }) => {
              const recBestOffer = recProd.listings && recProd.listings.length > 0
                ? [...recProd.listings].sort((a, b) => a.price - b.price)[0]
                : null;
              
              return (
                <div 
                  key={recProd._id}
                  onClick={() => navigate(`/products/${recProd._id}`)}
                  className="glass-card border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-5 hover:scale-[1.02] hover:shadow-xl hover:border-brand-primary/40 dark:hover:border-brand-primary/45 transition-all flex flex-col justify-between cursor-pointer text-left bg-white/5 dark:bg-slate-900/5"
                >
                  <div className="space-y-4">
                    <div className="w-full h-36 rounded-2xl overflow-hidden bg-white dark:bg-slate-950/20 p-2 flex items-center justify-center">
                      <img 
                        src={recProd.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'} 
                        alt={recProd.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{recProd.brand}</span>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1">{recProd.name}</h4>
                    </div>

                    <div className="flex items-center justify-between">
                      {recBestOffer ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-slate-800 dark:text-white">
                            ₹{recBestOffer.price.toLocaleString()}
                          </span>
                          <span className="text-xs line-through text-slate-450">
                            ₹{recBestOffer.originalPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Pricing unavailable</span>
                      )}

                      <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <Star size={10} className="fill-current" />
                        {recProd.rating}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-gradient-to-tr from-brand-primary/5 to-indigo-500/5 dark:from-brand-primary/10 dark:to-indigo-500/10 border border-brand-primary/10 dark:border-brand-primary/15 flex items-start gap-2">
                    <Sparkles size={14} className="text-brand-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-slate-650 dark:text-slate-300 font-medium">
                      {reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Alert modal sheet */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        product={product}
        currentLowestPrice={bestOffer.price}
      />

    </div>
  );
};

export default ProductDetails;
