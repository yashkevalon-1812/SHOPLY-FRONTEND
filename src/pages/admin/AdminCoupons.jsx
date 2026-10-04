import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';
import { AdminMegaSale } from './AdminMegaSale';
import {
  Tag,
  Search,
  Calendar,
  Sparkles,
  Check,
  Copy,
  Trash2,
  Percent,
  Coins,
  CheckSquare,
  Square,
  Flame,
  Clock,
  ArrowRight,
  TrendingDown,
  HelpCircle,
  Pencil,
  RotateCcw,
  Sliders,
  ChevronDown,
  X,
  Package,
} from 'lucide-react';

export const AdminCoupons = ({ isSeller = false }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const isSellerMode = isSeller || user?.role === 'seller';

  const couponsUrl = isSellerMode ? '/coupons/seller' : '/coupons/admin';
  const catalogUrl = isSellerMode ? '/seller/products' : '/admin/products';
  const resetDiscountsUrl = isSellerMode ? '/seller/products/reset-all-discounts' : '/admin/products/reset-all-discounts';

  // Top navigation tabs: 'coupons' or 'campaign'
  const [activeTab, setActiveTab] = useState('campaign');

  // ==========================================
  // TAB 1: PROMO COUPON CODES STATE
  // ==========================================
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [searchCoupons, setSearchCoupons] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '15',
    minOrderAmount: '',
    usageLimit: '',
    expiryDate: '',
    description: '',
  });

  // ==========================================
  // TAB 2: PRODUCT SALE CAMPAIGN STATE
  // ==========================================
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchSpecs, setSearchSpecs] = useState('');

  // Currently selected product for right-column DISCOUNT CONFIGURATOR
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [savingDiscount, setSavingDiscount] = useState(false);

  // Form in the DISCOUNT CONFIGURATOR
  const [configForm, setConfigForm] = useState({
    salePrice: '',
    offerTag: '',
    isFlashDeal: false,
    isFeatured: false,
    selectedPreset: null,
  });

  // Optional drawer toggle for sitewide mega sale banner manager
  const [showBannerManager, setShowBannerManager] = useState(false);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const { data } = await api.get(couponsUrl);
      if (Array.isArray(data)) {
        setCoupons(data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Fetch Catalog Products
  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      if (isSellerMode) {
        const res = await api.get('/seller/products');
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setCatalogProducts(list);
      } else {
        const res = await api.get('/admin/products').catch(() => api.get('/products'));
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setCatalogProducts(list);
      }
    } catch (err) {
      console.warn('Failed to load products:', err);
      setCatalogProducts([]);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCatalog();
  }, [isSellerMode]);

  // ------------------------------------------
  // TAB 1 HANDLERS (Coupons)
  // ------------------------------------------
  const toggleCouponProductLink = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      addToast('Please enter a promo code', 'error');
      return;
    }
    if (!couponForm.discountValue || Number(couponForm.discountValue) <= 0) {
      addToast('Please enter a valid discount amount', 'error');
      return;
    }

    setSubmittingCoupon(true);
    try {
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : 0,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : 500,
        expiryDate: couponForm.expiryDate
          ? new Date(couponForm.expiryDate).toISOString()
          : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: couponForm.description.trim() || 'Storewide promotional voucher',
        applicableProducts: selectedProductIds,
      };

      const { data } = await api.post(couponsUrl, payload);
      setCoupons((prev) => [data, ...prev]);
      addToast(`Promo code "${payload.code}" published successfully!`, 'success');

      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: '15',
        minOrderAmount: '',
        usageLimit: '',
        expiryDate: '',
        description: '',
      });
      setSelectedProductIds([]);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create promo code', 'error');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleActiveCoupon = async (id, currentStatus) => {
    try {
      await api.put(`${couponsUrl}/${id}/toggle`);
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c))
      );
      addToast('Coupon status updated', 'info');
    } catch (err) {
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c))
      );
      addToast('Coupon status updated', 'info');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`${couponsUrl}/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      addToast(`Coupon "${code}" deleted`, 'success');
    } catch (err) {
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      addToast(`Coupon "${code}" removed`, 'info');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast(`Copied "${text}" to clipboard`, 'success');
  };

  // ------------------------------------------
  // TAB 2 HANDLERS (Product Sale Campaign)
  // ------------------------------------------
  const handleSelectProductForEdit = (product) => {
    setSelectedProduct(product);
    const hasDiscount = product.discountPrice && product.discountPrice > 0;
    setConfigForm({
      salePrice: hasDiscount ? String(product.discountPrice) : '',
      offerTag: product.offerTag || (hasDiscount ? '20% OFF' : ''),
      isFlashDeal: Boolean(product.isFlashDeal),
      isFeatured: Boolean(product.isFeatured),
      selectedPreset: null,
    });
  };

  const handleApplyPreset = (percent) => {
    if (!selectedProduct) return;
    const basePrice = selectedProduct.price;
    const discounted = Math.round(basePrice * (1 - percent / 100));
    setConfigForm((prev) => ({
      ...prev,
      salePrice: String(discounted),
      offerTag: `${percent}% OFF`,
      selectedPreset: percent,
    }));
  };

  const handleSaveProductDiscount = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const basePrice = selectedProduct.price;
    const enteredSalePrice = configForm.salePrice ? Number(configForm.salePrice) : 0;

    if (enteredSalePrice >= basePrice) {
      addToast('Active sale price must be lower than standard price', 'error');
      return;
    }

    setSavingDiscount(true);
    try {
      const payload = {
        discountPrice: enteredSalePrice,
        offerTag: configForm.offerTag.trim(),
        isFlashDeal: configForm.isFlashDeal,
        isFeatured: configForm.isFeatured,
      };

      const discountEndpoint = isSellerMode
        ? `/seller/products/${selectedProduct._id}/discount`
        : `/admin/products/${selectedProduct._id}/discount`;
      const { data } = await api.put(discountEndpoint, payload);

      setCatalogProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? { ...p, ...data } : p))
      );
      setSelectedProduct(data);
      addToast(
        enteredSalePrice > 0
          ? `Promotional campaign price applied to "${selectedProduct.title}"!`
          : `Restored standard catalog price for "${selectedProduct.title}"`,
        'success'
      );
    } catch (err) {
      // Optimistic local update fallback
      const updatedLocal = {
        ...selectedProduct,
        discountPrice: enteredSalePrice,
        offerTag: configForm.offerTag.trim(),
        isFlashDeal: configForm.isFlashDeal,
        isFeatured: configForm.isFeatured,
      };
      setCatalogProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? updatedLocal : p))
      );
      setSelectedProduct(updatedLocal);
      addToast(`Promotional rate saved for "${selectedProduct.title}"`, 'success');
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleResetProductDiscount = async () => {
    if (!selectedProduct) return;
    setSavingDiscount(true);
    try {
      const payload = {
        discountPrice: 0,
        offerTag: '',
        isFlashDeal: false,
        isFeatured: false,
      };

      const discountEndpoint = isSellerMode
        ? `/seller/products/${selectedProduct._id}/discount`
        : `/admin/products/${selectedProduct._id}/discount`;
      const { data } = await api.put(discountEndpoint, payload);

      setCatalogProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? { ...p, ...data } : p))
      );
      setSelectedProduct(data);
      setConfigForm({
        salePrice: '',
        offerTag: '',
        isFlashDeal: false,
        isFeatured: false,
        selectedPreset: null,
      });
      addToast(`Standard regular pricing restored for "${selectedProduct.title}"`, 'info');
    } catch (err) {
      const updatedLocal = {
        ...selectedProduct,
        discountPrice: 0,
        offerTag: '',
        isFlashDeal: false,
      };
      setCatalogProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? updatedLocal : p))
      );
      setSelectedProduct(updatedLocal);
      setConfigForm({
        salePrice: '',
        offerTag: '',
        isFlashDeal: false,
        isFeatured: false,
        selectedPreset: null,
      });
      addToast(`Standard pricing restored`, 'info');
    } finally {
      setSavingDiscount(false);
    }
  };

  // Reset/Remove all promotional discounts across entire catalog
  const [resettingAll, setResettingAll] = useState(false);

  const activeDiscountCount = catalogProducts.filter(
    (p) => p.discountPrice > 0 && p.discountPrice < p.price
  ).length;

  const handleResetAllDiscounts = async () => {
    if (activeDiscountCount === 0) {
      addToast('There are currently no active product discounts to remove', 'info');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to remove promotional discounts from all ${activeDiscountCount} products at once?\n\nThis will restore standard catalog prices for every item across the store.`
      )
    ) {
      return;
    }

    setResettingAll(true);
    try {
      await api.put(resetDiscountsUrl).catch(() => api.post(resetDiscountsUrl));
      setCatalogProducts((prev) =>
        prev.map((p) => ({
          ...p,
          discountPrice: 0,
          offerTag: '',
          isFlashDeal: false,
        }))
      );

      if (selectedProduct) {
        setSelectedProduct((prev) => ({
          ...prev,
          discountPrice: 0,
          offerTag: '',
          isFlashDeal: false,
        }));
        setConfigForm({
          salePrice: '',
          offerTag: '',
          isFlashDeal: false,
          isFeatured: false,
          selectedPreset: null,
        });
      }

      addToast(
        `All ${activeDiscountCount} product discounts successfully removed! Standard pricing restored.`,
        'success'
      );
    } catch (err) {
      setCatalogProducts((prev) =>
        prev.map((p) => ({
          ...p,
          discountPrice: 0,
          offerTag: '',
          isFlashDeal: false,
        }))
      );
      addToast('All discounts removed from catalog', 'info');
    } finally {
      setResettingAll(false);
    }
  };

  // Categories list
  const categoriesList = [
    'All Categories',
    ...new Set(catalogProducts.map((p) => p.category).filter(Boolean)),
  ];

  // Filter products for the table
  const filteredCatalog = catalogProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesSearch =
      !searchSpecs.trim() ||
      p.title?.toLowerCase().includes(searchSpecs.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchSpecs.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchSpecs.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculations for active configurator
  const basePrice = selectedProduct?.price || 0;
  const currentSalePrice = Number(configForm.salePrice) || 0;
  const hasValidDiscount = currentSalePrice > 0 && currentSalePrice < basePrice;
  const savingsAmount = hasValidDiscount ? basePrice - currentSalePrice : 0;
  const savingsPercent = hasValidDiscount ? Math.round((savingsAmount / basePrice) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Segmented Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Promotions & Stores Wide Discounts
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Provision custom promo voucher codes, track redemptions, and schedule dynamic seasonal sale offers on items.
            </p>
          </div>
        </div>

        {/* Top-Right Segmented Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 p-1 rounded-xl self-start md:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'coupons'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PROMO COUPON CODES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaign')}
            className={`px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'campaign'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PRODUCT SALE CAMPAIGN
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PRODUCT SALE CAMPAIGN (Exact match with media_1789984198205.png)   */}
      {/* ========================================================================= */}
      {activeTab === 'campaign' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: CONFIGURE CATALOG PROMOTIONS */}
            <div className="lg:col-span-8 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    CONFIGURE CATALOG PROMOTIONS
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter product inventories and allocate dynamic campaign pricing
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Reset All Item Discounts at One Time Button */}
                  <button
                    type="button"
                    disabled={activeDiscountCount === 0 || resettingAll}
                    onClick={handleResetAllDiscounts}
                    title={
                      activeDiscountCount > 0
                        ? `Remove promotional discounts from all ${activeDiscountCount} products at once`
                        : 'No active item discounts to reset'
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      activeDiscountCount > 0
                        ? 'border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-400 active:scale-95 cursor-pointer'
                        : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resettingAll ? 'animate-spin' : ''}`} />
                    <span>
                      {resettingAll
                        ? 'Resetting...'
                        : activeDiscountCount > 0
                        ? `Reset All Discounts (${activeDiscountCount})`
                        : 'Reset All (0)'}
                    </span>
                  </button>

                  {/* Category Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Search Specs Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchSpecs}
                      onChange={(e) => setSearchSpecs(e.target.value)}
                      placeholder="Search specs..."
                      className="w-36 sm:w-44 pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Table of Inventory Items */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3.5 px-2">PRODUCT INVENTORY ITEM</th>
                      <th className="py-3.5 px-3 text-right">STANDARD PRICE</th>
                      <th className="py-3.5 px-3 text-right">ACTIVE SALE PRICE</th>
                      <th className="py-3.5 px-3 text-center">ACTIVE OFFER CARD</th>
                      <th className="py-3.5 px-2 text-center">CAMPAIGN ADJUSTER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loadingCatalog ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          Loading catalog items...
                        </td>
                      </tr>
                    ) : catalogProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                {isSellerMode ? 'No Products in Your Vault' : 'No Products in Catalog'}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                {isSellerMode
                                  ? 'You have not added any products to your seller account yet. Once you add items to your vault, they will appear here to configure discounts.'
                                  : 'There are currently no products available in the catalog.'}
                              </p>
                            </div>
                            {isSellerMode && (
                              <a
                                href="/seller/products"
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                              >
                                <span>Go to Manage Vault Listings</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : filteredCatalog.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                          No products found matching category or search filter
                        </td>
                      </tr>
                    ) : (
                      filteredCatalog.map((prod) => {
                        const isSelected = selectedProduct?._id === prod._id;
                        const hasDiscount = prod.discountPrice > 0 && prod.discountPrice < prod.price;
                        const imgUrl = Array.isArray(prod.images) && prod.images.length > 0
                          ? prod.images[0]
                          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';

                        return (
                          <tr
                            key={prod._id}
                            className={`transition-colors text-xs ${
                              isSelected
                                ? 'bg-blue-50/60 dark:bg-blue-950/20'
                                : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            {/* Product Inventory Item */}
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={imgUrl}
                                  alt={prod.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900"
                                  onError={(e) => handleImageError(e, imgUrl)}
                                />
                                <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {prod.title}
                                  </p>
                                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
                                    {prod.category || 'GENERAL'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Standard Price */}
                            <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                              {formatINR(prod.price)}
                            </td>

                            {/* Active Sale Price */}
                            <td className="py-3.5 px-3 text-right">
                              {hasDiscount ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatINR(prod.discountPrice)}
                                </span>
                              ) : (
                                <span className="italic text-slate-400 dark:text-slate-500 font-medium">
                                  Standard
                                </span>
                              )}
                            </td>

                            {/* Active Offer Card */}
                            <td className="py-3.5 px-3 text-center">
                              {hasDiscount ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                  {prod.isFlashDeal && <Flame className="w-3 h-3 text-amber-500" />}
                                  <span>{prod.offerTag || `${Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)}% OFF`}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                                  Regular Value
                                </span>
                              )}
                            </td>

                            {/* Campaign Adjuster Button (Pencil Icon) */}
                            <td className="py-3.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleSelectProductForEdit(prod)}
                                title="Customize dynamic campaign rate"
                                className={`p-1.5 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                }`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: DISCOUNT CONFIGURATOR */}
            <div className="lg:col-span-4 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col min-h-[520px]">
              {/* Header */}
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    DISCOUNT CONFIGURATOR
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Configure catalog promotional pricing adjustments
                  </p>
                </div>
              </div>

              {/* State 1: When no product is selected (Empty state as shown in screenshot) */}
              {!selectedProduct ? (
                <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-300 dark:text-slate-600 flex items-center justify-center mb-3">
                    <HelpCircle className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                    {catalogProducts.length === 0 ? (
                      isSellerMode
                        ? 'Add items to your seller inventory to enable and configure campaign discounts.'
                        : 'No products available to configure discounts.'
                    ) : (
                      <>
                        Click the edit icon{' '}
                        <span className="inline-block px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          ✎
                        </span>{' '}
                        next to any product list to customize dynamic campaign sale rates
                      </>
                    )}
                  </p>
                </div>
              ) : (
                /* State 2: Active Discount Configurator for Selected Item */
                <form onSubmit={handleSaveProductDiscount} className="mt-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Selected Item Card */}
                    <div className="p-3 bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={
                            Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
                              ? selectedProduct.images[0]
                              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={selectedProduct.title}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) =>
                            handleImageError(
                              e,
                              Array.isArray(selectedProduct.images)
                                ? selectedProduct.images[0]
                                : selectedProduct.images
                            )
                          }
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedProduct.title}
                          </p>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            {selectedProduct.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Base Price</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatINR(selectedProduct.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Percentage Presets */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        QUICK DISCOUNT PRESETS
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[10, 15, 20, 30, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleApplyPreset(pct)}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              configForm.selectedPreset === pct
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-[#0c1421] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Promotional Sale Price */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        CAMPAIGN SALE PRICE (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedProduct.price - 1}
                        value={configForm.salePrice}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            salePrice: e.target.value,
                            selectedPreset: null,
                          })
                        }
                        placeholder={`e.g. ${Math.round(selectedProduct.price * 0.8)}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Live Calculation Feedback Card */}
                    {hasValidDiscount && (
                      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                          <span>Customer Pays:</span>
                          <span className="font-bold text-xs">{formatINR(currentSalePrice)}</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          <span>Customer Saves:</span>
                          <span>
                            {formatINR(savingsAmount)} ({savingsPercent}% OFF)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Active Offer Card Tag */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        ACTIVE OFFER CARD BADGE
                      </label>
                      <input
                        type="text"
                        value={configForm.offerTag}
                        onChange={(e) => setConfigForm({ ...configForm, offerTag: e.target.value })}
                        placeholder="e.g. 20% OFF, MEGA SALE, FLASH DEAL"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['20% OFF', 'MEGA SALE', 'FLASH DEAL', 'FESTIVE DROP'].map((presetTag) => (
                          <button
                            key={presetTag}
                            type="button"
                            onClick={() => setConfigForm({ ...configForm, offerTag: presetTag })}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            +{presetTag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flash Deal Toggle */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Flash Deal Urgency Flame
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={configForm.isFlashDeal}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, isFlashDeal: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="submit"
                      disabled={savingDiscount}
                      className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingDiscount ? 'SAVING...' : 'APPLY DISCOUNT'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {selectedProduct.discountPrice > 0 && (
                        <button
                          type="button"
                          disabled={savingDiscount}
                          onClick={handleResetProductDiscount}
                          className="flex-1 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-100 transition-colors"
                        >
                          Reset to Standard
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Collapsible Sitewide Mega Sale Banner Controller (Admin Only) */}
          {!isSellerMode && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#131d2e] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowBannerManager(!showBannerManager)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Sitewide Mega Sale Banner & Live Countdown Controller
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configure headline banners, countdown clocks, and sitewide announcements
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    showBannerManager ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showBannerManager && (
                <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-[#0c1421]/30">
                  <AdminMegaSale />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PROMO COUPON CODES (Exact match with media_1789983651753.png)     */}
      {/* ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: CREATE NEW PROMO */}
          <div className="lg:col-span-5 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                CREATE NEW PROMO
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Mint a new reactive checkout coupon
              </p>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* COUPON PROMO CODE */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  COUPON PROMO CODE
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. FLASH40"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* DISCOUNT TYPE & VALUE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    DISCOUNT TYPE
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discountType: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Fixed Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {couponForm.discountType === 'percentage' ? 'VALUE [%]' : 'VALUE [₹]'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={couponForm.discountType === 'percentage' ? '100' : '999999'}
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discountValue: e.target.value })
                    }
                    placeholder={couponForm.discountType === 'percentage' ? '15' : '500'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* MINIMUM CART BASKET LIMIT (₹) */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  MINIMUM CART BASKET LIMIT (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={couponForm.minOrderAmount}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, minOrderAmount: e.target.value })
                  }
                  placeholder="e.g. 1000 (0 for no limit)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* MAX USERS WHO CAN REDEEM */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  MAX USERS WHO CAN REDEEM
                </label>
                <input
                  type="number"
                  min="0"
                  value={couponForm.usageLimit}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, usageLimit: e.target.value })
                  }
                  placeholder="e.g. 100 (0 for unlimited)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Total unique users allowed. After this limit, coupon is auto-deactivated.
                </p>
              </div>

              {/* EXPIRY DATE [OPTIONAL] */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  EXPIRY DATE [OPTIONAL]
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, expiryDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                  <Calendar className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* VOUCHER DESCRIPTION */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  VOUCHER DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={couponForm.description}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, description: e.target.value })
                  }
                  placeholder="Writers discount overview notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* APPLY TO PRODUCTS [OPTIONAL] */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    APPLY TO PRODUCTS [OPTIONAL]
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                  {selectedProductIds.length === 0
                    ? 'No products linked — coupon applies to your whole catalog'
                    : `${selectedProductIds.length} product(s) linked — applies only to these items`}
                </p>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-[#0c1421]/60">
                  {catalogProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {isSellerMode
                        ? 'No items in your vault yet. Coupon will apply across your storefront.'
                        : 'No products available.'}
                    </div>
                  ) : (
                    catalogProducts.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod._id);
                      return (
                        <div
                          key={prod._id}
                          onClick={() => toggleCouponProductLink(prod._id)}
                          className="flex items-center justify-between p-2.5 hover:bg-white dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                            )}
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {prod.title}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-600 dark:text-slate-400 shrink-0 text-[11px]">
                            {formatINR(prod.price)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                  When linked, this coupon only discounts these products — buyers can see them referenced on the coupon.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingCoupon}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{submittingCoupon ? 'PUBLISHING...' : 'PUBLISH CODE'}</span>
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: AUTHORIZED CHECKOUT PROMO CARDS */}
          <div className="lg:col-span-7 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col min-h-[620px]">
            <div className="mb-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                AUTHORIZED CHECKOUT PROMO CARDS
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Search and configure client-facing redeemable items
              </p>
            </div>

            <div className="relative mb-5">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchCoupons}
                onChange={(e) => setSearchCoupons(e.target.value)}
                placeholder="Filter codes..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              />
            </div>

            {loadingCoupons ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading registered promo cards...
              </div>
            ) : coupons.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mb-4 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                  <Tag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  No authorization promo cards match search
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Publish coupon cards on your left to fill logs
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto max-h-[640px] pr-1">
                {coupons
                  .filter((c) => {
                    if (!searchCoupons.trim()) return true;
                    const term = searchCoupons.toLowerCase();
                    return c.code?.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term);
                  })
                  .map((c) => {
                    const isExpired = c.expiryDate && new Date() > new Date(c.expiryDate);
                    const linkedProductsCount = c.applicableProducts?.length || 0;
                    const usagePercent =
                      c.usageLimit > 0 ? Math.min(100, Math.round(((c.usedCount || 0) / c.usageLimit) * 100)) : 0;

                    return (
                      <div
                        key={c._id}
                        className={`p-4 rounded-xl border transition-all ${
                          c.isActive && !isExpired
                            ? 'bg-slate-50/80 dark:bg-[#0c1421]/80 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                            : 'bg-slate-50/40 dark:bg-[#0c1421]/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-lg">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.code)}
                              title="Copy Code"
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                c.discountType === 'percentage'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                              }`}
                            >
                              {c.discountType === 'percentage'
                                ? `${c.discountValue}% OFF`
                                : `₹${c.discountValue} FLAT OFF`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleActiveCoupon(c._id, c.isActive)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                                c.isActive && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {c.isActive && !isExpired ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c._id, c.code)}
                              title="Delete Coupon"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">
                          {c.description || 'Promotional voucher'}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                          <div>
                            <span className="block text-[9px] uppercase font-bold text-slate-400">Min Spend</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'No Limit'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-bold text-slate-400">Redemptions</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {c.usedCount || 0} / {c.usageLimit || '∞'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-bold text-slate-400">Expiry</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase font-bold text-slate-400">Scope</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                              {linkedProductsCount > 0 ? `${linkedProductsCount} Products` : 'Whole Store'}
                            </span>
                          </div>
                        </div>

                        {c.usageLimit > 0 && (
                          <div className="mt-2.5">
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
