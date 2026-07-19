import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  SlidersHorizontal, 
  Trash2, 
  Layers, 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  DollarSign, 
  Tag, 
  Grid, 
  List,
  Sparkles
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ComparisonTable from '../components/ComparisonTable.jsx';
import { clearComparison, toggleAIAssistant } from '../store/slices/uiSlice.js';
import API from '../utils/api.js';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const query = searchParams.get('q') || '';
  const showCompareMatrixUrl = searchParams.get('compare') === 'true';

  const { comparisonProducts } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Advanced Filters States
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStore, setSelectedStore] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc', 'price_desc', 'discount_desc', 'rating_desc'

  // 1. Fetch Search Results and Wishlist
  const fetchResults = async () => {
    try {
      setLoading(true);
      
      const { data } = await API.get(`/products/search?q=${encodeURIComponent(query)}`);
      if (data.success) {
        setProducts(data.products);
        
        // Extract maximum price in current search to initialize price slider limit
        const prices = data.products.map(p => p.lowestPrice || 0);
        if (prices.length > 0) {
          setMaxPrice(Math.max(...prices, 5000));
        }
      }

      // Fetch user's wishlist IDs if authenticated
      if (isAuthenticated) {
        const wishRes = await API.get('/wishlist');
        if (wishRes.data.success) {
          setWishlistProductIds(wishRes.data.wishlist.map(w => w.productId?._id));
        }
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, isAuthenticated]);

  // 2. Compute available filter options
  const filterOptions = useMemo(() => {
    const brands = new Set();
    const categories = new Set();
    const stores = new Set();

    products.forEach((p) => {
      brands.add(p.brand);
      categories.add(p.category);
      p.listings.forEach((l) => stores.add(l.storeName));
    });

    return {
      brands: ['All', ...Array.from(brands)],
      categories: ['All', ...Array.from(categories)],
      stores: ['All', ...Array.from(stores)]
    };
  }, [products]);

  // 3. Apply sorting and filtering locally
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Brand
    if (selectedBrand !== 'All') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Filter by Price Limit
    result = result.filter((p) => (p.lowestPrice || 0) <= maxPrice);

    // Filter by Store existence
    if (selectedStore !== 'All') {
      result = result.filter((p) => 
        p.listings.some((l) => l.storeName === selectedStore)
      );
    }

    // Apply Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
    } else if (sortBy === 'discount_desc') {
      // Find max discount listing for each product and sort
      const maxDiscount = (p) => Math.max(...p.listings.map(l => l.discountPercentage), 0);
      result.sort((a, b) => maxDiscount(b) - maxDiscount(a));
    } else if (sortBy === 'rating_desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedBrand, selectedCategory, minRating, maxPrice, selectedStore, sortBy]);

  const handleClearFilters = () => {
    setSelectedBrand('All');
    setSelectedCategory('All');
    setSelectedStore('All');
    setMinRating(0);
    setSortBy('price_asc');
    
    const prices = products.map(p => p.lowestPrice || 0);
    if (prices.length > 0) {
      setMaxPrice(Math.max(...prices, 5000));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-4">
        <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} />
        <span className="text-slate-650 dark:text-slate-350">Search Results</span>
      </div>

      {/* Comparison Matrix Panel Toggle */}
      {showCompareMatrixUrl && (
        <section className="mb-10 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg md:text-xl font-black font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="text-brand-primary" size={20} />
                Product Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400 font-semibold">Comparing specs and listing arrays side-by-side</p>
            </div>
            
            <div className="flex items-center gap-3">
              {comparisonProducts.length > 0 && (
                <button
                  onClick={() => dispatch(clearComparison())}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={14} /> Clear list
                </button>
              )}
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                className="px-4 py-1.5 text-xs font-bold rounded-full glass-card hover:border-brand-primary border transition-all"
              >
                Close Matrix
              </button>
            </div>
          </div>

          <ComparisonTable productsList={comparisonProducts} />
        </section>
      )}

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: Filters widget */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl glass-card border p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850">
              <span className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> Filters
              </span>
              <button 
                onClick={handleClearFilters}
                className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Filter by Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-250 cursor-pointer"
              >
                {filterOptions.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by Brand */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-250 cursor-pointer"
              >
                {filterOptions.brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Filter by Store */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Shopping Website</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-250 cursor-pointer"
              >
                {filterOptions.stores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Price slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-350">Max Price</label>
                <span className="font-black text-brand-primary">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max={Math.max(...products.map(p => p.lowestPrice || 0), 150000)}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer"
              />
            </div>

            {/* Rating range */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Minimum Rating</label>
              <div className="flex items-center gap-1.5">
                {[0, 3.5, 4.0, 4.5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMinRating(val)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      minRating === val
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {val === 0 ? 'All' : `${val}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT COLUMN: Results grid */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Header controls (View layout toggle, sorting, query info) */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-3xl glass-card border p-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {loading ? 'Searching...' : `Found ${filteredProducts.length} deals for "${query}"`}
              </h2>
              {!loading && products.length > 0 && (
                <p className="text-xs text-slate-400 font-medium">Click "Add to Compare" to select items for side-by-side comparison</p>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              
              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-250 focus:outline-none cursor-pointer"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount_desc">Highest Discount</option>
                <option value="rating_desc">Best Rating</option>
              </select>

              {/* Grid/List switch */}
              <div className="hidden sm:flex border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-brand-primary text-white' 
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                  title="Grid view"
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-brand-primary text-white' 
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                  title="List view"
                >
                  <List size={14} />
                </button>
              </div>

              {/* Floating Compare trigger if items selected */}
              {comparisonProducts.length > 0 && !showCompareMatrixUrl && (
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&compare=true`)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:brightness-105 transition-all animate-bounce"
                >
                  <Layers size={12} /> Compare ({comparisonProducts.length})
                </button>
              )}

            </div>
          </div>

          {/* AI prompt assist banner */}
          {!loading && products.length > 0 && (
            <div className="p-4 rounded-3xl bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-primary">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Need help deciding?</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Let Shopino AI analyze pricing trends, reviews, and features for these products.</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(toggleAIAssistant(true))}
                className="px-4 py-1.5 text-[10px] font-bold text-white bg-brand-primary rounded-xl hover:bg-brand-secondary transition-all cursor-pointer"
              >
                Ask Assistant
              </button>
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="w-full h-80 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border dark:border-slate-850" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredProducts.map((prod) => (
                  <ProductCard 
                    key={prod._id} 
                    product={prod} 
                    isWishlisted={wishlistProductIds.includes(prod._id)}
                    onWishlistUpdate={fetchResults}
                  />
                ))}
              </div>
            ) : (
              // List View Layout
              <div className="space-y-4 animate-fade-in">
                {filteredProducts.map((prod) => {
                  const isWishlisted = wishlistProductIds.includes(prod._id);
                  const bestOffer = [...prod.listings].sort((a, b) => a.price - b.price)[0];
                  
                  return (
                    <div key={prod._id} className="rounded-3xl glass-card border p-4 flex flex-col sm:flex-row gap-5 hover:shadow-lg transition-all duration-300">
                      
                      {/* Image panel */}
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        onClick={() => navigate(`/product/${prod._id}`)}
                        className="w-full sm:w-36 h-36 object-cover rounded-2xl bg-slate-100 dark:bg-slate-900 cursor-pointer"
                      />

                      {/* Info details */}
                      <div className="flex-1 text-left flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary">{prod.brand}</span>
                            <div className="flex items-center gap-1 text-xs">
                              <Star size={12} className="text-amber-500 fill-current" />
                              <strong className="font-bold text-slate-700 dark:text-slate-300">{prod.rating}</strong>
                              <span className="text-slate-400">({prod.reviewsCount?.toLocaleString()})</span>
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 hover:text-brand-primary mt-0.5 cursor-pointer" onClick={() => navigate(`/product/${prod._id}`)}>
                            {prod.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between flex-wrap gap-2">
                          
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                              ₹{bestOffer.price.toLocaleString()}
                            </span>
                            <span className="text-xs line-through text-slate-450">
                              ₹{bestOffer.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Save {bestOffer.discountPercentage}% on {bestOffer.storeName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (comparisonProducts.some(p => p._id === prod._id)) {
                                  dispatch(clearComparison());
                                } else {
                                  if (comparisonProducts.length >= 3) {
                                    alert('Comparison matrix is limited to 3 items.');
                                    return;
                                  }
                                  dispatch(addToComparison(prod));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                comparisonProducts.some(p => p._id === prod._id)
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300'
                              }`}
                            >
                              <Layers size={12} />
                              {comparisonProducts.some(p => p._id === prod._id) ? 'Selected' : 'Compare'}
                            </button>
                            
                            <button
                              onClick={async () => {
                                if (!isAuthenticated) { navigate('/login'); return; }
                                isWishlisted 
                                  ? await API.delete(`/wishlist/${prod._id}`)
                                  : await API.post('/wishlist', { productId: prod._id });
                                fetchResults();
                              }}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                isWishlisted 
                                  ? 'bg-rose-500 border-rose-500 text-white' 
                                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500'
                              }`}
                            >
                              <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                            </button>

                            <button
                              onClick={() => navigate(`/product/${prod._id}`)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-[11px] font-bold hover:shadow"
                            >
                              Show Deals
                            </button>

                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="py-16 text-center text-slate-450 border border-dashed rounded-3xl">
              <ShoppingBag className="mx-auto mb-3" size={32} />
              No products found matching "{query}".
              <br />
              <button 
                onClick={() => navigate('/')} 
                className="mt-4 px-5 py-2.5 text-xs font-bold text-white bg-brand-primary rounded-full hover:bg-brand-secondary"
              >
                Go Home
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default SearchResults;
