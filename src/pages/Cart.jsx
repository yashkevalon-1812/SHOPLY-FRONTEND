import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Check,
  Truck,
  Store,
  Tag,
  Gift,
  Copy,
  X,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { handleImageError } from '../utils/imageHelper';

export const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQty,
    clearCart,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
    itemsPrice,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useCart();

  const { addToast } = useToast();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsModalOpen, setCouponsModalOpen] = useState(false);
  const [applyingCode, setApplyingCode] = useState('');

  // Fetch active store coupons for customer selection
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/coupons/active');
        if (Array.isArray(data)) {
          setAvailableCoupons(data);
        }
      } catch {
        setAvailableCoupons([]);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = await applyCoupon(promoInput.trim());
    if (res.success) {
      addToast(res.message, 'success');
      setPromoInput('');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleSelectCoupon = async (code) => {
    setApplyingCode(code);
    const res = await applyCoupon(code);
    if (res.success) {
      addToast(res.message, 'success');
      setCouponsModalOpen(false);
    } else {
      addToast(res.message, 'error');
    }
    setApplyingCode('');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    addToast(`Coupon code "${code}" copied to clipboard!`, 'info');
  };

  const freeShippingThreshold = 1999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - itemsPrice);
  const freeShippingProgress = Math.min(100, (itemsPrice / freeShippingThreshold) * 100);

  if (cartItems.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0b1120] text-zinc-900 dark:text-zinc-100 min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 transition-colors">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 flex items-center justify-center text-zinc-400 mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-zinc-950 dark:text-white mb-2">Your Vault Bag is Empty</h2>
        <p className="text-sm text-zinc-500 dark:text-slate-400 max-w-sm text-center mb-8">
          Explore our limited horology, acoustic, and precision tech editions to start building your collection.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-zinc-950 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-zinc-950/10 transition-all hover:scale-105"
        >
          <span>Explore Vault Catalog</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b1120] text-zinc-900 dark:text-zinc-100 min-h-screen py-6 sm:py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-slate-800 pb-5 sm:pb-6 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Checkout Bag
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-1">
              Shopping Cart ({cartItems.reduce((acc, i) => acc + i.qty, 0)})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-zinc-500 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
          >
            Clear All Items
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-800 p-4 rounded-2xl mb-8">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
              <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>
                {remainingForFreeShipping === 0 ? (
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    Unlocked: Complimentary Insured Air Shipping
                  </strong>
                ) : (
                  <>
                    Add <strong>{formatINR(remainingForFreeShipping)}</strong> more to qualify for FREE Shipping
                  </>
                )}
              </span>
            </span>
            <span className="text-zinc-500">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List Col */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={`${item.product}_${item.seller || 'default'}`}
                className="bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-zinc-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover border border-zinc-200 dark:border-slate-700 shrink-0 bg-white"
                    onError={(e) => handleImageError(e, item.image)}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {item.brand}
                    </span>
                    <Link
                      to={`/product/${item.product}`}
                      className="block font-black text-sm text-zinc-950 dark:text-white truncate hover:underline"
                    >
                      {item.title}
                    </Link>

                    {item.sellerName && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">
                        <Store className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>Sold by: {item.sellerName}</span>
                      </div>
                    )}

                    <div className="text-sm font-black text-zinc-900 dark:text-white mt-1">
                      {formatINR(item.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-zinc-200 dark:border-slate-800 pt-3 sm:pt-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-zinc-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0c1421] p-1">
                    <button
                      onClick={() => updateQty(item.product, item.qty - 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product, item.qty + 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-semibold text-zinc-400">Subtotal</span>
                    <span className="text-sm font-black text-zinc-950 dark:text-white">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar Col */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 sticky top-24 shadow-xs">
              <h2 className="text-base font-black text-zinc-950 dark:text-white border-b border-zinc-200 dark:border-slate-800 pb-4">
                Order Financial Summary
              </h2>

              {/* Promo Code Input & View Available Coupons Trigger */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Promo Voucher / Coupon
                  </label>
                  {availableCoupons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCouponsModalOpen(true)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Tag className="w-3 h-3" />
                      <span>View Offers ({availableCoupons.length})</span>
                    </button>
                  )}
                </div>

                {discountPercent > 0 || discountAmount > 0 ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        {couponCode} ({discountPercent > 0 ? `${discountPercent}%` : formatINR(discountAmount)} Applied)
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-500 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SHOPLY10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0c1421] border border-zinc-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white placeholder-zinc-400 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <button
                        type="submit"
                        className="bg-zinc-900 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>

                    {/* Quick 1-Click Available Coupon Pills */}
                    {availableCoupons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-slate-800/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Quick Apply Available:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {availableCoupons.slice(0, 3).map((cp) => (
                            <button
                              key={cp.code}
                              type="button"
                              onClick={() => handleSelectCoupon(cp.code)}
                              className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40 border border-blue-200/70 dark:border-blue-800/60 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>{cp.code}</span>
                              <span className="text-[9px] font-sans font-extrabold text-emerald-600 dark:text-emerald-400">
                                ({cp.discountType === 'percentage' ? `${cp.discountValue}%` : `₹${cp.discountValue}`})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-slate-400 border-t border-zinc-200 dark:border-slate-800 pt-4">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{formatINR(itemsPrice)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>
                      Discount Voucher {discountPercent > 0 ? `(${discountPercent}%)` : ''}
                    </span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {shippingPrice === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">Free</span>
                    ) : (
                      formatINR(shippingPrice)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (GST 18%)</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{formatINR(taxPrice)}</span>
                </div>

                <div className="border-t border-zinc-200 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-zinc-950 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-xl text-zinc-950 dark:text-white">{formatINR(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-zinc-950 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/10 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AVAILABLE COUPONS & OFFERS MODAL                          */}
      {/* ========================================================= */}
      {couponsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Available Offers & Coupons
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select a voucher to apply instantly to your cart
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCouponsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Coupons List */}
            <div className="p-5 max-h-[460px] overflow-y-auto space-y-3">
              {availableCoupons.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No promotional coupons available at this time.
                </div>
              ) : (
                availableCoupons.map((cp) => {
                  const isEligible = itemsPrice >= (cp.minOrderAmount || 0);
                  const isCurrent = couponCode === cp.code;
                  const isPercentage = cp.discountType === 'percentage';

                  return (
                    <div
                      key={cp._id || cp.code}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : isEligible
                          ? 'bg-slate-50/60 dark:bg-[#0c1421]/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                          : 'bg-slate-50/30 dark:bg-[#0c1421]/30 border-slate-200/50 dark:border-slate-800/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-lg">
                            {cp.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(cp.code)}
                            title="Copy code"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isPercentage
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {isPercentage ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT OFF`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">
                        {cp.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          {isEligible ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Eligible for this cart!</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              Add {formatINR(cp.minOrderAmount - itemsPrice)} more to unlock
                            </span>
                          )}
                        </div>

                        <div>
                          {isCurrent ? (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-lg">
                              APPLIED
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!isEligible || applyingCode === cp.code}
                              onClick={() => handleSelectCoupon(cp.code)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isEligible
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95 cursor-pointer'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {applyingCode === cp.code ? 'APPLYING...' : 'APPLY CODE'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
