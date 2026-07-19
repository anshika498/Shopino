import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Layers, ArrowRight, Star, Tag } from 'lucide-react';
import { addToComparison, removeFromComparison } from '../store/slices/uiSlice.js';
import API from '../utils/api.js';

const ProductCard = ({ product, onWishlistUpdate, isWishlisted = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { comparisonProducts } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isInComparison = comparisonProducts.some((p) => p._id === product._id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (isInComparison) {
      dispatch(removeFromComparison(product._id));
    } else {
      if (comparisonProducts.length >= 3) {
        alert('You can compare a maximum of 3 products at a time. Please remove an item first.');
        return;
      }
      dispatch(addToComparison(product));
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${product._id}`);
      } else {
        await API.post('/wishlist', { productId: product._id });
      }
      if (onWishlistUpdate) onWishlistUpdate();
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Find lowest price store details
  const listingsSorted = [...product.listings].sort((a, b) => a.price - b.price);
  const bestOffer = listingsSorted[0];

  return (
    <div className="group relative rounded-3xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col overflow-hidden">
      
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-sm">
            {product.brand}
          </span>
          {bestOffer.discountPercentage > 15 && (
            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-lg animate-pulse-slow">
              <Tag size={12} />
              Save {bestOffer.discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border shadow-md transition-all duration-200 cursor-pointer ${
            isWishlisted 
              ? 'bg-rose-500 border-rose-500 text-white' 
              : 'bg-white/80 border-slate-200/50 text-slate-500 hover:text-rose-500 hover:bg-white dark:bg-slate-800/80 dark:border-slate-700/50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Info Body */}
      <div className="flex flex-col flex-1 p-5 text-left">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-amber-500">
            <Star size={14} className="fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{product.rating}</span>
          <span className="text-xs text-slate-400">({product.reviewsCount?.toLocaleString()} reviews)</span>
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-primary transition-colors line-clamp-1">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        
        {/* Category Description */}
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[2rem]">
          {product.description}
        </p>

        {/* Comparison Details Panel */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Lowest Deal</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              ₹{bestOffer.price.toLocaleString()}
            </span>
            <span className="text-xs line-through text-slate-400 font-medium">
              ₹{bestOffer.originalPrice.toLocaleString()}
            </span>
            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              on {bestOffer.storeName}
            </span>
          </div>

          <p className="mt-2 text-xs font-medium text-slate-400">
            Compared across <span className="font-bold text-slate-700 dark:text-slate-300">{product.listings.length} stores</span>
          </p>
        </div>

        {/* Action Button Row */}
        <div className="mt-5 flex items-center justify-between gap-2 pt-2">
          {/* Comparison Matrix Button */}
          <button
            onClick={handleCompareClick}
            className={`flex items-center justify-center gap-1.5 flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              isInComparison
                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            {isInComparison ? 'Added to Compare' : 'Add to Compare'}
          </button>

          {/* Details Redirect */}
          <Link
            to={`/product/${product._id}`}
            className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-md transition-all"
            title="View full price breakdown"
          >
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
