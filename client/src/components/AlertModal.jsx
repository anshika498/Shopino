import React, { useState } from 'react';
import { X, Bell, CheckCircle, Info } from 'lucide-react';
import API from '../utils/api.js';

const AlertModal = ({ isOpen, onClose, product, currentLowestPrice }) => {
  const [targetPrice, setTargetPrice] = useState(Math.round(currentLowestPrice * 0.9)); // Default to 10% lower
  const [storeName, setStoreName] = useState('Any');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (targetPrice <= 0) {
      setError('Please enter a valid price threshold');
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/alerts', {
        productId: product._id,
        targetPrice: Number(targetPrice),
        storeName
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create price drop alert. Make sure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-3xl glass-card border shadow-2xl p-6 overflow-hidden animate-zoom-in z-10 text-left">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Price Drop Alert Set!</h3>
            <p className="mt-1.5 text-xs text-slate-400 text-center max-w-xs">
              We'll send you an email alert once the price of **{product.name}** falls below **₹{targetPrice.toLocaleString()}** on **{storeName}**.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Set Price Drop Alert</h3>
                <p className="text-xs text-slate-400 line-clamp-1">Track: {product.name}</p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Current details display */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
              <div>
                <p className="text-slate-400">Current Lowest Price</p>
                <p className="text-lg font-black text-slate-850 dark:text-slate-100 mt-0.5">
                  ₹{currentLowestPrice.toLocaleString()}
                </p>
              </div>
              <span className="text-[10px] font-black uppercase text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                on {product.bestOverallDealStore}
              </span>
            </div>

            {/* Target Price input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Notify me when price drops below (₹)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
              />
            </div>

            {/* Store dropdown selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                On Shopping Website
              </label>
              <select
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-brand-primary cursor-pointer"
              >
                <option value="Any">Any Platform (Lowest Price)</option>
                {product.listings.map((l) => (
                  <option key={l._id} value={l.storeName}>
                    {l.storeName} Only (Current: ₹{l.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl hover:shadow-lg hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer text-center"
              >
                {loading ? 'Creating Alert...' : 'Create Alert'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default AlertModal;
