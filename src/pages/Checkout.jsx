import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Banknote,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { handleImageError } from '../utils/imageHelper';
import { loadRazorpayScript } from '../utils/razorpay';
import { RazorpaySandboxModal } from '../components/payment/RazorpaySandboxModal';

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

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [sandboxPaymentData, setSandboxPaymentData] = useState(null);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Reset pendingOrderId if user modifies their cart
  useEffect(() => {
    setPendingOrderId(null);
  }, [cartItems]);

  // Pre-load Razorpay checkout script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-[#0b1120] text-zinc-900 dark:text-slate-100 min-h-[70vh] flex flex-col items-center justify-center px-4 transition-colors">
        <h2 className="text-xl font-bold mb-2">No items to checkout</h2>
        <Link to="/shop" className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Handle successful payment verification from either real Razorpay or Sandbox modal
  const handleVerifyPayment = async (orderId, rzpResponse) => {
    try {
      setSubmitting(true);
      const verifyPayload = {
        orderId,
        razorpay_order_id: rzpResponse.razorpay_order_id,
        razorpay_payment_id: rzpResponse.razorpay_payment_id,
        razorpay_signature: rzpResponse.razorpay_signature,
      };

      const { data } = await api.post('/payment/razorpay/verify', verifyPayload);
      clearCart();
      setPendingOrderId(null);
      addToast('Payment verified successfully via Razorpay!', 'success');
      navigate(`/order-success/${orderId}`);
    } catch (verifyErr) {
      console.error('Payment verification failed:', verifyErr);
      addToast(
        verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      // 1. If Cash on Delivery, complete immediately
      if (paymentMethod === 'Cash on Delivery') {
        const codOrderPayload = {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod: 'Cash on Delivery',
          itemsPrice,
          shippingPrice,
          taxPrice,
          discountAmount,
          totalPrice,
          couponCode,
        };
        const { data: createdOrder } = await api.post('/orders', codOrderPayload);
        clearCart();
        addToast('Order placed successfully (Cash on Delivery)!', 'success');
        navigate(`/order-success/${createdOrder._id}`);
        return;
      }

      // 3. Razorpay Payment Gateway Flow
      let currentOrderId = pendingOrderId;
      if (!currentOrderId) {
        const { data: createdOrder } = await api.post('/orders', {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod: 'Razorpay',
          itemsPrice,
          shippingPrice,
          taxPrice,
          discountAmount,
          totalPrice,
          couponCode,
        });
        currentOrderId = createdOrder._id;
        setPendingOrderId(createdOrder._id);
      }

      try {
        const { data: rzpData } = await api.post('/payment/razorpay/create-order', {
          orderId: currentOrderId,
        });

        const isScriptLoaded = await loadRazorpayScript();

        // If real Razorpay credentials are active and SDK script is loaded
        if (isScriptLoaded && rzpData.isRealMode && window.Razorpay) {
          const options = {
            key: rzpData.keyId,
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'Shoply',
            description: `Order Ref #${currentOrderId.slice(-8).toUpperCase()}`,
            image: 'https://cdn-icons-png.flaticon.com/512/9385/9385289.png',
            order_id: rzpData.razorpayOrderId,
            prefill: {
              name: rzpData.customer?.name || shippingAddress.fullName,
              email: rzpData.customer?.email || user?.email,
              contact: rzpData.customer?.phone || shippingAddress.phone,
            },
            notes: {
              orderId: currentOrderId,
            },
            theme: {
              color: '#0f172a',
            },
            handler: async (response) => {
              await handleVerifyPayment(currentOrderId, response);
            },
            modal: {
              ondismiss: () => {
                setSubmitting(false);
                addToast(
                  'Payment window closed. You can complete payment anytime from My Orders.',
                  'info'
                );
              },
            },
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.on('payment.failed', (response) => {
            setSubmitting(false);
            addToast(response.error?.description || 'Payment authorization failed.', 'error');
          });
          razorpayInstance.open();
        } else {
          // Open the interactive Razorpay Sandbox simulator modal
          setSandboxPaymentData({
            ...rzpData,
            orderId: currentOrderId,
            totalPrice,
          });
          setShowSandboxModal(true);
          setSubmitting(false);
        }
      } catch (rzpErr) {
        console.error('Razorpay initialization error:', rzpErr);
        addToast(
          rzpErr.response?.data?.message || 'Failed to initiate Razorpay gateway',
          'error'
        );
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
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
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>1. Insured Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    placeholder="Recipient name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Mobile Phone (Delivery SMS)</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    placeholder="Apt, Suite, Street name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    placeholder="State"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    placeholder="ZIP / Postal Code"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    placeholder="Country"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

              {/* Payment Methods */}
              <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>2. Payment Clearance</span>
                  </h2>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>100% Secure Checkout</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'Razorpay',
                      icon: Zap,
                      title: 'Online Payment',
                      desc: 'UPI, Cards, NetBanking, Wallets',
                      badge: 'Instant Auto-Clear',
                    },
                    {
                      id: 'Cash on Delivery',
                      icon: Banknote,
                      title: 'Cash on Delivery',
                      desc: 'Pay at Doorstep in Cash',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                        paymentMethod === m.id
                          ? 'bg-zinc-950 text-white dark:bg-amber-500 dark:text-slate-950 border-zinc-950 dark:border-amber-500 shadow-md ring-2 ring-blue-500/30'
                          : 'bg-zinc-50 dark:bg-slate-800 border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-200 hover:border-zinc-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {m.badge && (
                        <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                          {m.badge}
                        </span>
                      )}
                      <m.icon className="w-5 h-5 mb-2 text-amber-500 dark:text-inherit" />
                      <div>
                        <p className="text-xs font-bold leading-tight">{m.title}</p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            paymentMethod === m.id
                              ? 'text-zinc-300 dark:text-slate-800'
                              : 'text-zinc-500 dark:text-slate-400'
                          }`}
                        >
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Col */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 sticky top-24 shadow-xs">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-slate-800 pb-3">
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
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <span className="text-xs font-black text-zinc-900 dark:text-white">
                        {formatINR(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-zinc-200 dark:border-slate-800 pt-4 space-y-2 text-xs text-zinc-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {formatINR(itemsPrice)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>Discount</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Insured Shipping</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {shippingPrice === 0 ? 'Free' : formatINR(shippingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (GST 18%)</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {formatINR(taxPrice)}
                    </span>
                  </div>
                  <div className="border-t border-zinc-200 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-zinc-950 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-xl text-zinc-950 dark:text-white">
                      {formatINR(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 transition-all hover:scale-[1.01] cursor-pointer ${
                    paymentMethod === 'Razorpay'
                      ? 'bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 shadow-blue-600/20 dark:shadow-amber-500/20'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-zinc-950/10'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      <span>Confirming Order...</span>
                    </span>
                  ) : paymentMethod === 'Razorpay' ? (
                    <>
                      <span>Pay {formatINR(totalPrice)} Online</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Confirm Order (Cash on Delivery)</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero Risk · 256-bit Encrypted Transaction</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Razorpay Sandbox Modal */}
        <RazorpaySandboxModal
          isOpen={showSandboxModal}
          onClose={() => {
            setShowSandboxModal(false);
            setSubmitting(false);
          }}
          paymentData={sandboxPaymentData}
          onPaymentSuccess={(rzpResponse) => {
            setShowSandboxModal(false);
            if (sandboxPaymentData?.orderId) {
              handleVerifyPayment(sandboxPaymentData.orderId, rzpResponse);
            }
          }}
          onPaymentCancel={async () => {
            setShowSandboxModal(false);
            setSubmitting(false);
            if (pendingOrderId) {
              try {
                await api.put(`/orders/${pendingOrderId}/cancel`);
                setPendingOrderId(null);
              } catch (cancelErr) {
                console.warn('Failed to auto-cancel order on dismiss:', cancelErr);
              }
            }
            addToast('Payment cancelled. Stock restored.', 'info');
          }}
        />
      </div>
    );
  };
