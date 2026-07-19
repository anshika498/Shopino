import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto border-t border-slate-100 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/20 py-8 text-slate-500 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          
          <div className="md:col-span-2">
            <span className="text-xl font-bold font-display text-gradient">Shopino</span>
            <p className="mt-3 text-sm text-slate-400 max-w-sm">
              Your intelligent shopping aggregator. Search once and instantly compare prices, delivery terms, and coupon options across Amazon, Flipkart, Croma, Ajio, and more. Powered by AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Popular Searches</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/search?q=iPhone%2016" className="hover:text-brand-primary transition-colors">iPhone 16 Deals</a></li>
              <li><a href="/search?q=Galaxy%20S25" className="hover:text-brand-primary transition-colors">Galaxy S25 Comparison</a></li>
              <li><a href="/search?q=HP%20Victus" className="hover:text-brand-primary transition-colors">HP Victus Gaming</a></li>
              <li><a href="/search?q=Nike" className="hover:text-brand-primary transition-colors">Nike Air Max</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="cursor-pointer hover:text-brand-primary transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-brand-primary transition-colors">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-brand-primary transition-colors">Disclaimer</span></li>
              <li><span className="cursor-pointer hover:text-brand-primary transition-colors flex items-center gap-1"><Sparkles size={12}/> Gemini Engine</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Shopino Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
