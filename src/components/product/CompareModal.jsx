import { useState } from 'react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';
import { Link } from 'react-router-dom';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  ArrowLeftRight,
  Sparkles,
  Store,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const CompareModal = () => {
  const { compareItems, isCompareOpen, closeCompare, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (!isCompareOpen) return null;

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    addToast(`Added "${product.title}" to cart`, 'success');
  };

  const lowestPrice =
    compareItems.length > 0
      ? Math.min(
          ...compareItems.map((item) =>
            item.discountPrice > 0 ? item.discountPrice : item.price
          )
        )
      : 0;

  // Helper to check if a property is identical across all items
  const isIdentical = (getter) => {
    if (compareItems.length <= 1) return true;
    const firstVal = getter(compareItems[0]);
    return compareItems.every((item) => getter(item) === firstVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-6xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        
        {/* Responsive Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-[#131d2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Header Left: Icon, Title & Badges */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">
                    Side-By-Side
                  </span>
                  <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400 font-medium">
                    {compareItems.length} products
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate mt-0.5">
                  Compare Items & Sellers
                </h2>
              </div>
            </div>

            {/* Mobile Close Button (Top-Right) */}
            <button
              onClick={closeCompare}
              className="sm:hidden p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2 cursor-pointer"
              aria-label="Close compare modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header Right: Toolbar Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              {/* Toggle highlight differences */}
              <button
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  highlightDifferences
                    ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-2xs font-bold'
                    : 'bg-white dark:bg-[#0c1421] border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:border-zinc-300'
                }`}
                title="Highlight attributes that differ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Differences</span>
              </button>

              <button
                onClick={clearCompare}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={closeCompare}
              className="hidden sm:flex p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close compare modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Swipe Assistance Banner */}
        {compareItems.length > 0 && (
          <div className="sm:hidden px-3.5 py-1.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 text-[10px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium">
              <span>👉</span> Swipe horizontally to compare items
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              Sticky Attributes
            </span>
          </div>
        )}

        {/* Modal Body: Responsive Comparison Table with Sticky Labels */}
        <div className="overflow-x-auto overflow-y-auto flex-1 p-2.5 sm:p-5 scrollbar-thin">
          {compareItems.length === 0 ? (
            <div className="py-16 text-center">
              <ArrowLeftRight className="w-12 h-12 text-zinc-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                No items in comparison list
              </h3>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mb-4">
                Click the "Compare" button on any product card or details page to compare them side-by-side.
              </p>
              <button
                onClick={closeCompare}
                className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left min-w-full">
              <thead>
                <tr>
                  {/* Sticky Attribute Header on Left */}
                  <th className="sticky left-0 z-30 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider bg-zinc-100/95 dark:bg-[#131d2e]/95 backdrop-blur-md border-r border-b border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)]">
                    Product
                  </th>

                  {/* Product Header Cards */}
                  {compareItems.map((item) => (
                    <th
                      key={item._id}
                      className="p-2.5 sm:p-3 align-top min-w-[170px] sm:min-w-[210px] max-w-[260px] border-b border-l border-zinc-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]"
                    >
                      <div className="relative group">
                        <button
                          onClick={() => removeFromCompare(item._id)}
                          className="absolute -top-1 -right-1 p-1 bg-zinc-200 hover:bg-rose-600 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 rounded-full text-zinc-500 transition-colors shadow-xs z-10 cursor-pointer"
                          title="Remove from compare"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-slate-800 overflow-hidden mb-2 border border-zinc-200 dark:border-slate-700">
                          <img
                            src={
                              Array.isArray(item.images) && item.images.length > 0
                                ? item.images[0]
                                : typeof item.images === 'string'
                                ? item.images
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
                            }
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, Array.isArray(item.images) ? item.images[0] : item.images)}
                          />
                        </div>

                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block truncate">
                          {item.category}
                        </span>
                        <Link
                          to={`/product/${item._id}`}
                          onClick={closeCompare}
                          className="block font-bold text-xs sm:text-sm text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mt-0.5 leading-snug"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 dark:divide-slate-800 text-xs">
                {/* Row: Price */}
                <tr className={highlightDifferences && !isIdentical((i) => i.discountPrice || i.price) ? 'bg-amber-500/10' : ''}>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    Price
                  </td>
                  {compareItems.map((item) => {
                    const effPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
                    const isLowest = effPrice === lowestPrice;

                    return (
                      <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-black text-zinc-950 dark:text-white">
                            {formatINR(effPrice)}
                          </span>
                          {item.discountPrice > 0 && item.discountPrice < item.price && (
                            <span className="text-[10px] sm:text-[11px] text-zinc-400 line-through">
                              {formatINR(item.price)}
                            </span>
                          )}
                        </div>
                        {isLowest && compareItems.length > 1 && (
                          <span className="inline-block mt-1 bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                            Lowest Price
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Seller Information */}
                <tr className={highlightDifferences && !isIdentical((i) => i.seller?.shopName || i.seller?.name) ? 'bg-amber-500/10' : ''}>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Seller</span>
                    </span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800">
                      <div className="font-bold text-zinc-900 dark:text-white truncate">
                        {item.seller?.shopName || item.seller?.name || 'Shoply Official Direct'}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400 flex flex-wrap items-center gap-1 mt-0.5">
                        <span className="text-emerald-600 font-semibold">Verified Merchant</span>
                        <span>•</span>
                        <span>4.8 ★</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Customer Rating */}
                <tr className={highlightDifferences && !isIdentical((i) => i.rating) ? 'bg-amber-500/10' : ''}>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    Customer Rating
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                        <span className="text-zinc-900 dark:text-white">
                          {item.rating ? item.rating.toFixed(1) : '5.0'}
                        </span>
                        <span className="text-zinc-400 text-[10px] font-normal truncate">
                          ({item.numReviews || 0})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Brand */}
                <tr className={highlightDifferences && !isIdentical((i) => i.brand) ? 'bg-amber-500/10' : ''}>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    Brand / Maker
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 font-semibold text-zinc-800 dark:text-slate-200 border-l border-zinc-200 dark:border-slate-800 truncate">
                      {item.brand || 'Shoply Selection'}
                    </td>
                  ))}
                </tr>

                {/* Row: Delivery & Shipping */}
                <tr>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Delivery</span>
                    </span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800 text-zinc-700 dark:text-slate-300">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        FREE Delivery
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400">
                        Dispatch &lt; 24h
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Warranty & Returns */}
                <tr>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Protection</span>
                    </span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800 text-zinc-700 dark:text-slate-300">
                      <div className="font-medium">1 Year Warranty</div>
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400">
                        7 Days Free Returns
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Stock Status */}
                <tr className={highlightDifferences && !isIdentical((i) => i.stock > 0) ? 'bg-amber-500/10' : ''}>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    Stock Status
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800">
                      {item.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          <Check className="w-3.5 h-3.5 shrink-0" /> In Stock ({item.stock})
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Action CTA Row */}
                <tr>
                  <td className="sticky left-0 z-20 w-24 sm:w-36 md:w-44 p-2.5 sm:p-3 font-bold text-zinc-700 dark:text-slate-300 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-r border-zinc-200 dark:border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.3)] text-[11px] sm:text-xs">
                    Action
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-2.5 sm:p-3 border-l border-zinc-200 dark:border-slate-800">
                      <div className="space-y-1.5">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock === 0}
                          className="w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span>Add to Cart</span>
                        </button>
                        <Link
                          to={`/product/${item._id}`}
                          onClick={closeCompare}
                          className="w-full block text-center text-[10px] sm:text-[11px] font-semibold text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white py-1"
                        >
                          View Details →
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Responsive Modal Footer */}
        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-[#131d2e] border-t border-zinc-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-zinc-500 dark:text-slate-400 text-center sm:text-left">
          <span className="text-[11px] sm:text-xs">
            Compare up to 4 items simultaneously to find the best value and verified seller.
          </span>
          <button
            onClick={closeCompare}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-800 dark:text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
