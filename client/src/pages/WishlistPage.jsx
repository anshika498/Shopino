import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronRight, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import API from '../utils/api.js';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/wishlist');
      if (data.success) {
        setWishlistItems(data.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-6">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} />
        <span className="text-slate-600 dark:text-slate-300">Wishlist</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Heart className="text-rose-500 fill-rose-500" size={24} />
          My Wishlist
        </h1>
        <p className="text-xs text-slate-400 font-medium">Track pricing status and deals for all your bookmarked items</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-full h-80 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border dark:border-slate-850" />
          ))}
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <ProductCard 
              key={item._id} 
              product={item.productId} 
              isWishlisted={true}
              onWishlistUpdate={fetchWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-450 border border-dashed rounded-3xl max-w-lg mx-auto">
          <ShoppingBag className="mx-auto mb-3" size={32} />
          Your wishlist is currently empty.
          <br />
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-5 py-2.5 text-xs font-bold text-white bg-brand-primary rounded-full hover:bg-brand-secondary cursor-pointer"
          >
            Find Products
          </button>
        </div>
      )}

    </div>
  );
};

export default WishlistPage;
