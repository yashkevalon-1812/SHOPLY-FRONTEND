import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { useWishlist } from '../../context/WishlistContext';
import { Star, ShoppingBag, Zap, Flame, ArrowLeftRight, Heart } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { addToCompare, isInCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const inCompare = isInCompare(product._id);
  const isWishlisted = isInWishlist(product._id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const mainImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : typeof product.images === 'string'
      ? product.images
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`Added "${product.title}" to your cart`, 'success');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 hover:border-zinc-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-zinc-950/5 dark:hover:shadow-black/30">
      {/* Product Image Container */}
      <Link to={`/product/${product._id}`} className="relative block aspect-square overflow-hidden bg-zinc-50 dark:bg-[#0c1421]">
        <img
          src={mainImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => handleImageError(e, mainImage)}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {(product.isMegaFlashSale || product.offerTag === 'MEGA FLASH SALE') ? (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] tracking-wide uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              <Zap className="w-3 h-3 fill-white" /> Mega Flash
            </span>
          ) : product.isFlashDeal ? (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-zinc-950 font-black text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full shadow-sm">
              <Flame className="w-3 h-3 fill-zinc-950" /> Flash Deal
            </span>
          ) : null}
        </div>

        {/* Top-Right Action Buttons: Wishlist & Compare */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
          {/* Wishlist Like Heart Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-rose-600 text-white shadow-rose-600/30 scale-105'
                : 'bg-white/90 dark:bg-slate-900/90 text-zinc-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white shadow-2xs'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white stroke-white' : ''}`} />
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCompare(product);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
              inCompare
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-white/90 dark:bg-slate-900/90 text-zinc-600 dark:text-slate-300 hover:text-blue-600 hover:bg-white shadow-2xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
            }`}
            title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
            aria-label="Compare item"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stock Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-amber-700 dark:text-amber-400 font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 shadow-xs">
              Only {product.stock} left!
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-white/95 dark:bg-slate-900/95 text-rose-600 dark:text-rose-400 font-bold text-[10px] px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 shadow-xs">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-zinc-500 dark:text-slate-400 tracking-wider uppercase text-[9px] sm:text-[10px]">
              {product.category}
            </span>
            <span className="text-zinc-400 dark:text-slate-500 truncate max-w-[100px] text-[10px] sm:text-xs">{product.brand}</span>
          </div>

          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-1.5">
              {product.title}
            </h3>
          </Link>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] sm:text-xs font-bold ml-1 text-zinc-900 dark:text-slate-200">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-slate-500">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-base sm:text-lg font-black text-zinc-950 dark:text-white">
              {formatINR(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-slate-500 line-through font-medium">
                {formatINR(product.price)}
              </span>
            )}
          </div>

          {/* Action CTAs: Add to Cart + Buy Now */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-100 dark:border-slate-800">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-zinc-800 dark:text-slate-200 font-bold text-[11px] sm:text-xs py-1.5 px-1 sm:px-1.5 rounded-lg transition-all cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3 h-3 text-zinc-600 dark:text-slate-300 shrink-0" />
              <span className="truncate">Add</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-[11px] sm:text-xs py-1.5 px-1 sm:px-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
              title="Instant Direct Checkout"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
