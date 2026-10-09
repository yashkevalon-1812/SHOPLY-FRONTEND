import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { SellerComparisonModal } from '../components/product/SellerComparisonModal';
import { getSellerOffers } from '../utils/productOffers';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Store,
  ChevronRight,
  Flame,
  MessageSquare,
  Check,
  CheckCircle2,
  ArrowLeftRight,
  Sparkles,
  Award,
  Heart,
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { handleImageError } from '../utils/imageHelper';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { addToCompare, isInCompare, openCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);



  useEffect(() => {
    setSelectedOffer(null);
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }

        const relatedRes = await api.get(`/products/related/${id}`);
        setRelated(relatedRes.data);
      } catch (err) {
        console.error('Failed to load product:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const offers = getSellerOffers(product);
  const activeOffer = selectedOffer || (offers.length > 0 ? offers[0] : null);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, activeOffer);
    const sellerTag = activeOffer?.sellerName ? ` from ${activeOffer.sellerName}` : '';
    addToast(`Added ${quantity} × "${product.title}"${sellerTag} to cart`, 'success');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, activeOffer);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setProduct(data.product);
      setReviewComment('');
      addToast('Thank you! Your verified review has been submitted.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Assembled specification list including standard attributes and custom key-values
  const specsList = useMemo(() => {
    if (!product) return [];
    const list = [
      { label: 'Category', value: product.category },
      { label: 'Brand / Maker', value: product.brand || 'Shoply Selection' },
      ...(product.sku ? [{ label: 'SKU / Model Identifier', value: product.sku }] : []),
      ...(product.barcode && product.barcode !== 'EXEMPT'
        ? [{ label: 'Barcode / UPC', value: product.barcode }]
        : []),
      { label: 'Item Condition', value: product.condition || 'Brand New (Sealed)' },
      { label: 'Fulfillment Channel', value: product.fulfillmentChannel || 'Shoply Fulfilled' },
      {
        label: 'Official Warranty',
        value:
          product.warranty ||
          (product.specifications &&
            (product.specifications instanceof Map
              ? product.specifications.get('Warranty')
              : product.specifications['Warranty'])) ||
          '1 Year Official Warranty',
      },
    ];

    if (product.specifications) {
      const customEntries =
        product.specifications instanceof Map
          ? Array.from(product.specifications.entries())
          : typeof product.specifications === 'object'
          ? Object.entries(product.specifications)
          : [];

      for (const [k, v] of customEntries) {
        if (
          k &&
          v &&
          k !== 'Warranty' &&
          !list.some((item) => item.label.toLowerCase() === k.toLowerCase())
        ) {
          list.push({ label: k, value: String(v) });
        }
      }
    }

    list.push({ label: 'Platform Reference ID', value: product._id });
    list.push({ label: 'Authentication', value: 'Verified Genuine Platform Guarantee' });

    return list;
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b1120] text-center px-4 transition-colors">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Item Not Found</h2>
        <p className="text-sm text-zinc-500 dark:text-slate-400 mb-6">The requested product could not be located in our vault.</p>
        <Link to="/shop" className="bg-zinc-950 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold px-6 py-3 rounded-xl shadow-md">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const baseStandardPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const effectivePrice = activeOffer ? activeOffer.price : baseStandardPrice;
  const hasDiscount = product.price > effectivePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - effectivePrice) / product.price) * 100)
    : 0;
  const currentSellerName =
    activeOffer?.sellerName ||
    product.seller?.shopName ||
    product.seller?.name ||
    'Shoply Official Direct';
  const lowestOfferPrice = offers.length > 0 ? Math.min(...offers.map((o) => o.price)) : effectivePrice;
  const isWishlisted = isInWishlist(product?._id);

  return (
    <div className="bg-slate-50 dark:bg-[#0b1120] text-zinc-900 dark:text-slate-100 min-h-screen py-10 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400 mb-8">
          <Link to="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link to="/shop" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-800 dark:text-slate-200 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Top Product Hero: Gallery + Buying Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
          {/* Gallery Col */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3.5] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-lg">
              <img
                src={selectedImage || product.images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => handleImageError(e, selectedImage || product.images?.[0])}
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md w-fit inline-flex items-center justify-center whitespace-nowrap">
                  SAVE {discountPercent}%
                </div>
              )}

              {/* Like / Wishlist Button on Hero Image */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-600 text-white shadow-rose-600/30 scale-105'
                    : 'bg-white/90 text-zinc-700 hover:text-rose-600 hover:bg-white'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white stroke-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail switcher */}
            {product.images?.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-zinc-900 scale-95 shadow-md'
                        : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, img)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buying & Decision Details Col */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                  {product.brand || 'Shoply Selection'}
                </span>
                <span className="text-xs text-zinc-600 font-semibold bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                  {product.category}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 leading-tight">
                {product.title}
              </h1>

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-zinc-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-zinc-900 ml-2">
                    {(product.rating || 5).toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-zinc-300">·</span>
                <span className="text-xs text-zinc-500 font-medium">
                  {product.numReviews || 0} Collector Ratings
                </span>
              </div>

              {/* Price Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                      {formatINR(effectivePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs sm:text-sm text-zinc-400 line-through font-medium">
                        {formatINR(product.price)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-slate-400 mt-1">
                    Taxes calculated at checkout · Free insured express delivery included
                  </p>
                </div>

                {hasDiscount && (
                  <span className="self-start sm:self-auto bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black px-3 py-1 rounded-xl shrink-0">
                    Save {formatINR(product.price - effectivePrice)}
                  </span>
                )}
              </div>

              {/* Multi-Seller Comparison Banner (Eliminates Customer Confusion) */}
              {offers.length > 1 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#131d2e] dark:to-[#0f172a] border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                      <Store className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{offers.length} Verified Sellers for this Item</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-slate-400 mt-0.5">
                      Selected: <strong className="text-zinc-900 dark:text-white">{currentSellerName}</strong>
                      {lowestOfferPrice < effectivePrice && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold ml-1.5">
                          (Other sellers from {formatINR(lowestOfferPrice)}!)
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsSellerModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Compare Sellers</span>
                  </button>
                </div>
              )}



              {/* Urgency Stock Alert */}
              <div>
                {product.stock > 0 && product.stock <= 5 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2.5 rounded-xl">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚡ Low Inventory Alert: Only {product.stock} pieces remaining in vault!</span>
                  </div>
                ) : product.stock > 5 ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>In Stock · Insured Express Dispatch within 24 Hours</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
                    Out of Stock · Please check back soon
                  </div>
                )}
              </div>

              {/* Quantity Stepper */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs font-bold text-zinc-700">Quantity:</span>
                  <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 text-zinc-600 hover:text-zinc-950 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-zinc-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-2.5 text-zinc-600 hover:text-zinc-950 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Amazon-style About this item Bullet Points */}
              {product.bulletPoints && product.bulletPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 space-y-2.5 shadow-2xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
                    <span>About this item</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-slate-300">
                    {product.bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conversion Buttons: Buy Now & Add to Cart */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/10 transition-all hover:scale-[1.01]"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Buy Now — Instant Direct Checkout</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-zinc-200 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-zinc-600" />
                  <span>Add to Shopping Cart</span>
                </button>

              </div>
            </div>

            {/* Assurance Icons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200 text-center text-[11px] text-zinc-500 font-medium">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Express Insured</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Certified Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>30-Day Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info: Description, Specifications, Shipping & Customer Reviews */}
        <div className="border-t border-zinc-200 dark:border-slate-800 pt-10 mb-16">
          <div className="flex items-center gap-8 border-b border-zinc-200 dark:border-slate-800 pb-4 mb-8 overflow-x-auto">
            {['description', 'specifications', 'shipping', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold uppercase tracking-wider pb-4 -mb-4 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'text-zinc-950 dark:text-white border-b-2 border-zinc-950 dark:border-amber-400 font-black'
                    : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${product.reviews?.length || 0})` : tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-sm sm:text-base text-zinc-700 dark:text-slate-300 leading-relaxed">
              <p>{product.description}</p>
              <p>
                Every edition is hand-inspected under high-magnification optical sensors to ensure surface perfection, mechanical tolerance, and adherence to certified luxury specifications.
              </p>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="max-w-2xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-slate-800 text-xs shadow-2xs">
              {specsList.map((item, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                  <span className="text-zinc-500 dark:text-slate-400 font-medium text-[11px] sm:text-xs">{item.label}</span>
                  <span
                    className={`font-bold text-left sm:text-right text-xs break-words ${
                      item.label === 'Authentication'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Shipping */}
          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-4 text-sm text-zinc-700 dark:text-slate-300 leading-relaxed">
              <p>
                Orders placed before 2:00 PM EST ship same day via insured express courier. Each parcel is wrapped in custom velvet-lined presentation packaging and enclosed in a discreet, tamper-proof exterior carton.
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-slate-400 text-xs">
                <li>Complimentary signature on delivery</li>
                <li>Real-time GPS dispatch alerts sent via SMS and email</li>
                <li>Zero customs duty surcharge for North American and European collectors</li>
              </ul>
            </div>
          )}

          {/* Tab 4: Reviews & Review Form */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Existing Reviews */}
              <div className="lg:col-span-7 space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 space-y-2.5 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">{rev.name}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-500">
                          {[...Array(rev.rating)].map((_, r) => (
                            <Star key={r} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-zinc-400 dark:text-slate-500 block pt-1">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Verified Collector Experience'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-slate-400 py-6">
                    No reviews yet. Be the first to share your collector appraisal!
                  </p>
                )}
              </div>

              {/* Submit Review */}
              <div className="lg:col-span-5 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Write a Review
                </h3>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mb-4">
                  Share your appraisal with the global Shoply community.
                </p>

                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-slate-300 block mb-1.5">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setReviewRating(num)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                num <= reviewRating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-zinc-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-zinc-800 dark:text-slate-200 ml-2">
                          {reviewRating} of 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-slate-300 block mb-1.5">
                        Review Comment
                      </label>
                      <textarea
                        required
                        rows="3"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Detail the materials, tactile response, and finish..."
                        className="w-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-zinc-500 dark:text-slate-400 mb-4">
                      Please sign in to your Shoply account to leave a verified review.
                    </p>
                    <Link
                      to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                      className="inline-block bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                    >
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="border-t border-zinc-200 dark:border-slate-800 pt-16">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white mb-6">
              Complementary Vault Items
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 xl:gap-8">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
        {/* Multi-Seller Comparison Modal */}
        <SellerComparisonModal
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          product={product}
          offers={offers}
          activeOffer={activeOffer}
          onSelectOffer={(offer) => setSelectedOffer(offer)}
        />
      </div>
    </div>
  );
};
