import React from 'react';
import { 
  TrendingDown, 
  Star, 
  Truck, 
  Award, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

const ComparisonTable = ({ product, productsList }) => {
  
  // CASE 1: Compare store listings for a SINGLE product
  if (product && !productsList) {
    const listings = [...product.listings].sort((a, b) => a.price - b.price);

    return (
      <div className="w-full overflow-hidden rounded-3xl glass-card border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20 text-xs font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">Store</th>
                <th className="py-4 px-4 text-right">Price & Deal</th>
                <th className="py-4 px-4 text-center">Discount</th>
                <th className="py-4 px-4 text-center">Rating</th>
                <th className="py-4 px-4">Delivery</th>
                <th className="py-4 px-4">Offers</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-sm">
              {listings.map((l) => {
                const isLowest = l.price === product.lowestPrice;
                const isBestRated = l.storeName === product.bestRatedStore;
                const isFastest = l.storeName === product.fastestDeliveryStore;
                const isBestOverall = l.storeName === product.bestOverallDealStore;

                return (
                  <tr 
                    key={l._id} 
                    className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                      isLowest ? 'bg-emerald-500/5 dark:bg-emerald-500/5' : ''
                    }`}
                  >
                    {/* Store Logo/Name */}
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-100">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 font-bold">
                          {l.storeName}
                          {isLowest && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                              <TrendingDown size={10} /> Lowest
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Seller Rating: ⭐ {l.sellerRating}</span>
                      </div>
                    </td>

                    {/* Price and Deal tag */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                          ₹{l.price.toLocaleString()}
                        </span>
                        <span className="text-xs line-through text-slate-400">
                          ₹{l.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 text-xs font-black text-rose-500 bg-rose-500/10 rounded-full">
                        {l.discountPercentage}% OFF
                      </span>
                    </td>

                    {/* Store specific rating */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{l.rating}</span>
                        <span className="text-amber-500 flex items-center"><Star size={12} className="fill-current" /></span>
                        <span className="text-[10px] text-slate-400">({l.reviewsCount.toLocaleString()})</span>
                      </div>
                    </td>

                    {/* Delivery information */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="flex items-center gap-1 font-semibold">
                          <Truck size={14} className="text-slate-400" />
                          {l.deliveryTime}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {l.deliveryCharges === 0 ? 'Free Shipping' : `+ ₹${l.deliveryCharges} shipping`}
                        </span>
                      </div>
                    </td>

                    {/* Offers, coupons and cashbacks */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5 max-w-[150px] text-[11px]">
                        {l.couponCode && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Use code: <span className="font-black text-brand-primary border border-dashed border-brand-primary/40 px-1 rounded bg-brand-primary/5">{l.couponCode}</span>
                          </span>
                        )}
                        {l.cashback && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold leading-tight">
                            {l.cashback}
                          </span>
                        )}
                        {!l.couponCode && !l.cashback && (
                          <span className="text-slate-400 italic">No specific coupons</span>
                        )}
                      </div>
                    </td>

                    {/* Purchase redirect */}
                    <td className="py-4 px-6 text-right">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full hover:shadow-lg transition-all"
                      >
                        Buy Now
                        <ExternalLink size={12} />
                      </a>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // CASE 2: Compare MULTIPLE products side-by-side matrix
  if (productsList && productsList.length > 0) {
    // Collect all spec keys from compared items
    const allSpecKeys = new Set();
    productsList.forEach((p) => {
      if (p.specs) {
        Object.keys(p.specs instanceof Map ? Object.fromEntries(p.specs) : p.specs).forEach((k) => allSpecKeys.add(k));
      }
    });
    const specKeysArray = Array.from(allSpecKeys);

    return (
      <div className="w-full overflow-hidden rounded-3xl glass-card border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20">
                <th className="py-5 px-6 text-left text-xs font-black uppercase text-slate-400 tracking-wider w-1/4">
                  Comparison Matrix
                </th>
                {productsList.map((p) => (
                  <th key={p._id} className="py-5 px-6 text-left w-1/4">
                    <div className="flex gap-4 items-center">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-16 h-16 object-cover rounded-xl border bg-slate-100 dark:bg-slate-900"
                      />
                      <div>
                        <span className="text-xs font-black uppercase bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                          {p.brand}
                        </span>
                        <h4 className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100 line-clamp-1">{p.name}</h4>
                      </div>
                    </div>
                  </th>
                ))}
                {/* Pad columns to match 3 product limit layout */}
                {productsList.length < 3 && 
                  Array.from({ length: 3 - productsList.length }).map((_, idx) => (
                    <th key={`pad-head-${idx}`} className="w-1/4 py-5 px-6 text-slate-300 dark:text-slate-700 italic text-xs font-medium">
                      Add another product to compare...
                    </th>
                  ))
                }
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-sm">
              {/* Row 1: Lowest Price */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="py-4 px-6 font-bold text-slate-400">Lowest Price</td>
                {productsList.map((p) => (
                  <td key={p._id} className="py-4 px-6 text-left">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                        ₹{p.lowestPrice?.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">
                        Offers across {p.listings.length} stores
                      </span>
                    </div>
                  </td>
                ))}
                {productsList.length < 3 && 
                  Array.from({ length: 3 - productsList.length }).map((_, idx) => (
                    <td key={`pad-price-${idx}`} className="py-4 px-6 text-slate-300 dark:text-slate-800">-</td>
                  ))
                }
              </tr>

              {/* Row 2: Customer Rating */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="py-4 px-6 font-bold text-slate-400">Rating</td>
                {productsList.map((p) => (
                  <td key={p._id} className="py-4 px-6 text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">{p.rating}</span>
                      <Star size={14} className="text-amber-500 fill-current" />
                      <span className="text-xs text-slate-400">({p.reviewsCount.toLocaleString()})</span>
                    </div>
                  </td>
                ))}
                {productsList.length < 3 && 
                  Array.from({ length: 3 - productsList.length }).map((_, idx) => (
                    <td key={`pad-rating-${idx}`} className="py-4 px-6 text-slate-300 dark:text-slate-800">-</td>
                  ))
                }
              </tr>

              {/* Row 3: Deal Analysis Summary */}
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="py-4 px-6 font-bold text-slate-400">Highlights</td>
                {productsList.map((p) => (
                  <td key={p._id} className="py-4 px-6 text-left">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-600 dark:text-slate-300">
                        ⭐ Best Store: <strong className="font-bold">{p.bestRatedStore}</strong>
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        🚚 Fastest: <strong className="font-bold">{p.fastestDeliveryStore}</strong>
                      </span>
                    </div>
                  </td>
                ))}
                {productsList.length < 3 && 
                  Array.from({ length: 3 - productsList.length }).map((_, idx) => (
                    <td key={`pad-high-${idx}`} className="py-4 px-6 text-slate-300 dark:text-slate-800">-</td>
                  ))
                }
              </tr>

              {/* Dynamic Specs Rows */}
              {specKeysArray.map((key) => (
                <tr key={key} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                  <td className="py-4 px-6 font-semibold text-slate-400">{key}</td>
                  {productsList.map((p) => {
                    const specsMap = p.specs instanceof Map ? Object.fromEntries(p.specs) : p.specs;
                    const val = specsMap?.[key] || 'N/A';
                    return (
                      <td key={p._id} className="py-4 px-6 text-left text-slate-600 dark:text-slate-300 font-medium">
                        {val}
                      </td>
                    );
                  })}
                  {productsList.length < 3 && 
                    Array.from({ length: 3 - productsList.length }).map((_, idx) => (
                      <td key={`pad-spec-${key}-${idx}`} className="py-4 px-6 text-slate-300 dark:text-slate-800">-</td>
                    ))
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/30 border border-dashed rounded-3xl">
      <ShoppingBag className="mx-auto mb-3" size={32} />
      No listings or products provided for comparison.
    </div>
  );
};

export default ComparisonTable;
