import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';
import {
  Tag,
  Sparkles,
  Gift,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ShoppingBag,
  Percent,
  Coins,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const Offers = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'percentage', 'flat'
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const fetchActiveCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons/active');
      if (Array.isArray(data)) {
        setCoupons(data);
      }
      } catch (err) {
        console.error('Failed to load active coupons:', err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Coupon code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => {
      setCopiedCode('');
    }, 2500);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesType =
      filterType === 'all' || c.discountType === filterType;
    const matchesSearch =
      !searchTerm.trim() ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Promotional Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-950 text-white p-8 sm:p-12 shadow-xl border border-blue-600/30">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Storewide Vouchers</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Exclusive Coupons & Discount Offers
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Explore verified discount vouchers, percentage deductions, and seasonal promotional codes. Apply these codes at checkout to unlock instant savings on your order.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Eligible Products</span>
              </Link>

              <Link
                to="/cart"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all border border-white/20"
              >
                <span>Go to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative background sparkle shape */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <Gift className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#131d2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Coupons ({coupons.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('percentage')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'percentage'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              % Discounts
            </button>
            <button
              type="button"
              onClick={() => setFilterType('flat')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'flat'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Flat Cash (₹)
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coupon codes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Coupons Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading active store discounts...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No promo vouchers match your search
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try changing your filter criteria or search keyword
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((cp) => {
              const isPercentage = cp.discountType === 'percentage';
              const isCopied = copiedCode === cp.code;

              return (
                <div
                  key={cp._id || cp.code}
                  className="bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between relative group"
                >
                  {/* Top Bar: Code & Discount Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      {/* Code Badge */}
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-3 py-1 rounded-xl">
                        <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                          {cp.code}
                        </span>
                      </div>

                      {/* Discount Pill */}
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                          isPercentage
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {isPercentage ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT OFF`}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
                      {cp.description}
                    </p>

                    {/* Details / Conditions */}
                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 mb-5">
                      <div className="flex items-center justify-between">
                        <span>Minimum Spend:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {cp.minOrderAmount > 0 ? formatINR(cp.minOrderAmount) : 'No Minimum'}
                        </span>
                      </div>

                      {cp.maxDiscountAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Max Discount Cap:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatINR(cp.maxDiscountAmount)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span>Validity:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cp.expiryDate ? new Date(cp.expiryDate).toLocaleDateString() : 'Ongoing Promo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Copy Code & Apply in Cart */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(cp.code)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY CODE</span>
                        </>
                      )}
                    </button>

                    <Link
                      to="/cart"
                      className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1 transition-all shadow-xs"
                    >
                      <span>APPLY</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3-Step Walkthrough Guide on How to Redeem */}
        <div className="bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6 text-center sm:text-left">
            How to Redeem Your Promotional Voucher
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Copy or Note Code
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Click <strong>COPY CODE</strong> on any coupon card above or select it directly inside your shopping bag.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Add Items to Bag
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ensure your cart basket meets the minimum spend requirements for maximum savings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Instant Discount Applied
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Paste or click Apply in your Cart. Your total will instantly deduct the savings before checkout!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
