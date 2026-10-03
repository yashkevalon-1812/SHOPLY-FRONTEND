import { useState } from 'react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
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
  ExternalLink,
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
      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between bg-zinc-50 dark:bg-[#131d2e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                  Side-By-Side Comparison
                </span>
                <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">
                  {compareItems.length} products
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                Compare Items & Sellers
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle highlight differences */}
            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                highlightDifferences
                  ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-2xs font-bold'
                  : 'bg-white dark:bg-[#0c1421] border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:border-zinc-300'
              }`}
              title="Highlight attributes that differ"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Highlight Differences</span>
            </button>

            <button
              onClick={clearCompare}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-slate-800 transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={closeCompare}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Comparison Table */}
        <div className="overflow-x-auto overflow-y-auto flex-1 p-4 sm:p-6">
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
                className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-36 sm:w-44 p-3 text-[11px] font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-[#131d2e]/50 rounded-l-xl">
                    Product
                  </th>
                  {compareItems.map((item) => (
                    <th
                      key={item._id}
                      className="p-3 align-top min-w-[200px] max-w-[260px] border-l border-zinc-100 dark:border-slate-800"
                    >
                      <div className="relative group">
                        <button
                          onClick={() => removeFromCompare(item._id)}
                          className="absolute -top-1 -right-1 p-1 bg-zinc-200 hover:bg-rose-600 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 rounded-full text-zinc-500 transition-colors shadow-xs"
                          title="Remove from compare"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-full aspect-square rounded-2xl bg-zinc-100 dark:bg-slate-800 overflow-hidden mb-2.5 border border-zinc-200 dark:border-slate-700">
                          <img
                            src={
                              Array.isArray(item.images) && item.images.length > 0
                                ? item.images[0]
                                : typeof item.images === 'string'
                                ? item.images
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
                            }
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {item.category}
                        </span>
                        <Link
                          to={`/product/${item._id}`}
                          onClick={closeCompare}
                          className="block font-bold text-xs sm:text-sm text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mt-0.5"
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
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">Price</td>
                  {compareItems.map((item) => {
                    const effPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
                    const isLowest = effPrice === lowestPrice;

                    return (
                      <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-zinc-950 dark:text-white">
                            {formatINR(effPrice)}
                          </span>
                          {item.discountPrice > 0 && item.discountPrice < item.price && (
                            <span className="text-[11px] text-zinc-400 line-through">
                              {formatINR(item.price)}
                            </span>
                          )}
                        </div>
                        {isLowest && compareItems.length > 1 && (
                          <span className="inline-block mt-1 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            Lowest Price
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Seller Information */}
                <tr className={highlightDifferences && !isIdentical((i) => i.seller?.shopName || i.seller?.name) ? 'bg-amber-500/10' : ''}>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>Seller</span>
                    </span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800">
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {item.seller?.shopName || item.seller?.name || 'Shoply Official Direct'}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="text-emerald-600 font-semibold">Verified Merchant</span>
                        <span>•</span>
                        <span>4.8 ★</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Customer Rating */}
                <tr className={highlightDifferences && !isIdentical((i) => i.rating) ? 'bg-amber-500/10' : ''}>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">Customer Rating</td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span className="text-zinc-900 dark:text-white">
                          {item.rating ? item.rating.toFixed(1) : '5.0'}
                        </span>
                        <span className="text-zinc-400 text-[10px] font-normal">
                          ({item.numReviews || 0} reviews)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Brand */}
                <tr className={highlightDifferences && !isIdentical((i) => i.brand) ? 'bg-amber-500/10' : ''}>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">Brand / Maker</td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 font-semibold text-zinc-800 dark:text-slate-200 border-l border-zinc-100 dark:border-slate-800">
                      {item.brand || 'Shoply Selection'}
                    </td>
                  ))}
                </tr>

                {/* Row: Delivery & Shipping */}
                <tr>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Delivery</span>
                    </span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800 text-zinc-700 dark:text-slate-300">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        FREE Delivery Available
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400">
                        Express Dispatch within 24 Hours
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Warranty & Returns */}
                <tr>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>Protection</span>
                    </span>
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800 text-zinc-700 dark:text-slate-300">
                      <div>1 Year Brand Warranty</div>
                      <div className="text-[10px] text-zinc-500 dark:text-slate-400">
                        7 Days Free Replacement
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Availability */}
                <tr className={highlightDifferences && !isIdentical((i) => i.stock > 0) ? 'bg-amber-500/10' : ''}>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">Stock Status</td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800">
                      {item.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" /> In Stock ({item.stock} left)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Action CTA Row */}
                <tr>
                  <td className="p-3 font-bold text-zinc-500 dark:text-slate-400">Action</td>
                  {compareItems.map((item) => (
                    <td key={item._id} className="p-3 border-l border-zinc-100 dark:border-slate-800">
                      <div className="space-y-1.5">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock === 0}
                          className="w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <Link
                          to={`/product/${item._id}`}
                          onClick={closeCompare}
                          className="w-full block text-center text-[11px] font-semibold text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white py-1"
                        >
                          View Full Details →
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-[#131d2e] border-t border-zinc-200 dark:border-slate-800 flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
          <span>Compare up to 4 items simultaneously to find the best value and seller.</span>
          <button
            onClick={closeCompare}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-800 dark:text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
