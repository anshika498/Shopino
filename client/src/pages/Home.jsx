import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Star, TrendingUp, Layers, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import API from '../utils/api.js';

const Home = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [trendingDeals, setTrendingDeals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Get trending high-discount deals and top rated list
        const [dealsRes, topRes] = await Promise.all([
          API.get('/products/deals/trending'),
          API.get('/products/trending/list')
        ]);
        
        setTrendingDeals(dealsRes.data.products || []);
        setTopRated(topRes.data.products || []);
      } catch (error) {
        console.error('Error fetching home page products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const categories = [
    { name: 'Electronics', query: 'electronics', icon: '💻' },
    { name: 'Fashion & Style', query: 'fashion', icon: '👟' },
    { name: 'Beauty & Skincare', query: 'beauty', icon: '🧴' }
  ];

  return (
    <div className="w-full flex flex-col items-center pb-16">
      
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 grid-bg flex flex-col items-center text-center px-4 overflow-hidden border-b border-slate-100 dark:border-slate-800/40">
        
        {/* Animated backdrop glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Feature Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary mb-6 animate-pulse-slow">
          <Sparkles size={14} />
          <span>Real-time Store Aggregator</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-slate-800 dark:text-slate-100 max-w-3xl leading-none">
          Compare Prices Across Stores <span className="text-gradient">Instantly</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mt-4 text-sm md:text-base text-slate-400 max-w-xl font-medium leading-relaxed">
          Search for laptops, smartphones, fashion, and cosmetics. Compare deals, ratings, and shipping speeds from all websites side-by-side using AI insights.
        </p>

        {/* Large Central Search Input */}
        <form 
          onSubmit={handleSearchSubmit}
          className="mt-10 w-full max-w-2xl relative rounded-3xl overflow-hidden glass-card p-2 border shadow-2xl flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="What are you shopping for? (e.g. iPhone 16, HP Victus, Nike)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl bg-transparent text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
          </div>
          <button 
            type="submit"
            className="px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl hover:shadow-xl hover:brightness-105 active:scale-98 transition-all cursor-pointer text-center"
          >
            Search & Compare
          </button>
        </form>

        {/* Popular Categories chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/search?q=${encodeURIComponent(cat.query)}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold glass-card hover:border-brand-primary/40 hover:text-brand-primary transition-all cursor-pointer border"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

      </section>

      {/* Main content body */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 space-y-16 text-left">
        
        {/* Features highlight row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-card border flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Lowest Price Alerts</h3>
              <p className="mt-1 text-xs text-slate-400">Set a target price and get instantly notified via dashboard when the item drops in price.</p>
            </div>
          </div>
          <div className="p-6 rounded-3xl glass-card border flex items-start gap-4">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">AI Buying Advice</h3>
              <p className="mt-1 text-xs text-slate-400">Our integrated LLM compares price history, reviews, and specs to recommend the best purchase timeframe.</p>
            </div>
          </div>
          <div className="p-6 rounded-3xl glass-card border flex items-start gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-2xl">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Side-by-Side Matrix</h3>
              <p className="mt-1 text-xs text-slate-400">Select up to 3 items and compare detailed technical specifications and store listing grids in one table.</p>
            </div>
          </div>
        </section>

        {/* Section 1: Trending Offers */}
        <section className="space-y-6">
          <div className="flex justify-between items-baseline">
            <div>
              <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-slate-800 dark:text-slate-100">
                Today's Best Deals
              </h2>
              <p className="text-xs text-slate-400 font-medium">Aggregated across all stores with discounts of 15% or more</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full h-80 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border dark:border-slate-850" />
              ))}
            </div>
          ) : trendingDeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingDeals.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 border border-dashed rounded-3xl">
              No products matching deals filters found. Make a search to generate mock datasets.
            </div>
          )}
        </section>

        {/* Section 2: Top Rated Products */}
        <section className="space-y-6">
          <div className="flex justify-between items-baseline">
            <div>
              <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-slate-800 dark:text-slate-100">
                Top Rated Products
              </h2>
              <p className="text-xs text-slate-400 font-medium">High satisfaction ratings and positive sentiment scores</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full h-80 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border dark:border-slate-850" />
              ))}
            </div>
          ) : topRated.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRated.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 border border-dashed rounded-3xl">
              No items matching top-rated catalog found.
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Home;
