import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/product/ProductCard';
import {
  Heart,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const Wishlist = () => {
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddAllToCart = () => {
    if (!wishlistItems || wishlistItems.length === 0) return;
    let addedCount = 0;
    wishlistItems.forEach((product) => {
      if (product.stock > 0) {
        addToCart(product, 1);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      addToast(`Added ${addedCount} in-stock items to your cart!`, 'success');
    } else {
      addToast('No items currently in stock to add.', 'warning');
    }
  };

  return (
    <div className="bg-white dark:bg-[#0b1120] text-zinc-900 dark:text-white min-h-[85vh] py-8 sm:py-12 transition-colors">
      <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400 mb-6 font-medium">
          <Link to="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-600" />
          <span className="text-zinc-800 dark:text-slate-200 font-semibold">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 border-b border-zinc-200/80 dark:border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Personal Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-1">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">
              {wishlistCount > 0
                ? `You have saved ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} to your wishlist`
                : 'Your wishlist is currently empty'}
            </p>
          </div>

          {/* Top Actions: Add All to Cart & Clear Wishlist */}
          {wishlistCount > 0 && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={clearWishlist}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800/80 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/30 dark:hover:border-rose-800 text-zinc-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Remove all saved items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Wishlist</span>
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
                title="Add all items to cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add All to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {wishlistCount === 0 ? (
          /* Empty State */
          <div className="bg-zinc-50/80 dark:bg-[#0f172a]/60 border border-zinc-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-14 text-center max-w-xl mx-auto my-8 sm:my-14 shadow-xs">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shadow-inner">
                <Heart className="w-10 h-10 fill-rose-500/20 stroke-rose-500 dark:stroke-rose-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              You haven't liked any products yet. Browse through our catalog and tap the heart icon on any product to add it here!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/offers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-800 dark:text-slate-200 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all border border-zinc-200 dark:border-slate-700"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Offers & Deals</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Products Grid */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {wishlistItems.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
