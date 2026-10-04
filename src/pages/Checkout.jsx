import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { handleImageError } from '../utils/imageHelper';

export const Checkout = () => {
  const {
    cartItems,
    clearCart,
    itemsPrice,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice,
    couponCode,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card');
  const [submitting, setSubmitting] = useState(false);

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  if (cartItems.length === 0) {
    return (
      <div className="bg-white text-zinc-900 min-h-[70vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-xl font-bold mb-2">No items to checkout</h2>
        <Link to="/shop" className="text-amber-600 hover:underline text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please sign in or create an account to finalize your order', 'info');
      navigate('/login?redirect=checkout');
      return;
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      addToast('Please complete all shipping address fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discountAmount,
        totalPrice,
        couponCode,
      };

      const { data } = await api.post('/orders', orderPayload);
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order-success/${data._id}`);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0b1329] text-zinc-900 dark:text-white min-h-screen py-6 sm:py-10 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-zinc-200 dark:border-slate-800 pb-5 sm:pb-6 mb-6 sm:mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Secure Step 2
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-1">
            Express Vault Checkout
          </h1>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                You are currently checking out as a guest. Sign in to save this order to your collector profile!
              </span>
            </div>
            <Link
              to="/login?redirect=checkout"
              className="self-start sm:self-auto bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-xs whitespace-nowrap transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Left Form: Shipping + Payment */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>1. Insured Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    placeholder="Recipient name"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Mobile Phone (Delivery SMS)</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-700 font-bold block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    placeholder="Apt, Suite, Street name"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    placeholder="State"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    placeholder="ZIP / Postal Code"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    placeholder="Country"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>2. Payment Clearance</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Credit/Debit Card', icon: CreditCard, title: 'Card', desc: 'Instant Processing' },
                  { id: 'UPI', icon: QrCode, title: 'UPI / Net Banking', desc: 'Direct Transfer' },
                  { id: 'Cash on Delivery', icon: Banknote, title: 'Cash on Delivery', desc: 'Pay at Doorstep' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === m.id
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    <m.icon className="w-5 h-5 mb-2" />
                    <div>
                      <p className="text-xs font-bold">{m.title}</p>
                      <p className={`text-[10px] ${paymentMethod === m.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {m.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Simulated Card Fields */}
              {paymentMethod === 'Credit/Debit Card' && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-600 font-semibold block mb-1">Card Number (Simulated)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-zinc-900 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-600 font-semibold block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-zinc-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-600 font-semibold block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-zinc-900 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <Lock className="w-3 h-3" /> Encrypted with 256-bit instant 3D-Secure payment gateway
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Col */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-5 sticky top-24 shadow-xs">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-3">
                Review & Confirm Order
              </h2>

              {/* Item Previews */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                      onError={(e) => handleImageError(e, item.image)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-500">Qty: {item.qty}</p>
                    </div>
                    <span className="text-xs font-black text-zinc-900">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-200 pt-4 space-y-2 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatINR(itemsPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Shipping</span>
                  <span className="font-semibold text-zinc-900">
                    {shippingPrice === 0 ? 'Free' : formatINR(shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (GST 18%)</span>
                  <span className="font-semibold text-zinc-900">{formatINR(taxPrice)}</span>
                </div>
                <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-black text-zinc-950">
                  <span>Total Amount</span>
                  <span className="text-xl text-zinc-950">{formatINR(totalPrice)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/10 transition-all hover:scale-[1.01]"
              >
                {submitting ? (
                  <span>Authorizing Payment...</span>
                ) : (
                  <>
                    <span>Place Order & Authorize</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Risk · Fully Protected Transaction</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
