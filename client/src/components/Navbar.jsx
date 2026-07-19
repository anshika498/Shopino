import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Search, 
  User, 
  Heart, 
  Layers, 
  MessageSquare,
  LogOut,
  Sliders,
  Sparkles
} from 'lucide-react';
import { toggleTheme, toggleAIAssistant, clearComparison } from '../store/slices/uiSlice.js';
import { logout } from '../store/slices/authSlice.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, comparisonProducts } = useSelector((state) => state.ui);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearComparison());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full transition-colors duration-300 glass-effect border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black font-display text-gradient tracking-tight">
                Shopino
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Compare products (e.g. iPhone 16, Nike Air Max...)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
            </div>
            <button 
              type="submit" 
              className="absolute right-1 top-1 bottom-1 px-4 text-xs font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full hover:shadow-lg transition-all"
            >
              Compare
            </button>
          </form>

          {/* Actions & Navigation Controls */}
          <div className="flex items-center gap-2">
            {/* Dark Mode toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* AI Assistant toggle */}
            <button
              onClick={() => dispatch(toggleAIAssistant(true))}
              className="p-2 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary dark:text-brand-accent transition-colors flex items-center gap-1 font-medium text-sm px-3"
              title="Open AI Shopping assistant"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Comparison Cart Badge */}
            <Link
              to="/search?compare=true"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
              title="View product comparison matrix"
            >
              <Layers size={20} />
              {comparisonProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold rounded-full animate-bounce">
                  {comparisonProducts.length}
                </span>
              )}
            </Link>

            {/* Wishlist Link */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title="Your Wishlist"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-primary to-rose-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user?.name?.substring(0, 2)}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold pr-1">{user?.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-card overflow-hidden py-1 shadow-xl border z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-brand-primary/10 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User size={16} /> User Dashboard
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-brand-primary/10 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Sliders size={16} /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full hover:shadow-lg transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden py-3 border-t border-slate-100 dark:border-slate-800/40">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <button 
              type="submit" 
              className="absolute right-1 top-1 bottom-1 px-3 text-[10px] font-bold text-white bg-brand-primary rounded-full hover:bg-brand-secondary transition-all"
            >
              Go
            </button>
          </form>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
