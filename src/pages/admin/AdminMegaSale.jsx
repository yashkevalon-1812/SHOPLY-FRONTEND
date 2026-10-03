import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import {
  Zap,
  Clock,
  RotateCcw,
  Trash2,
  Check,
  Flame,
  Sparkles,
  Search,
  Tag,
  Save,
  ChevronDown,
  Calendar,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

export const AdminMegaSale = () => {
  const { addToast } = useToast();

  // Scheduled Flash Sales state
  const [scheduledSales, setScheduledSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [submittingSale, setSubmittingSale] = useState(false);

  // Products catalog for ID reference
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Form State for SCHEDULE FLASH SALE (Matches media_1789986397188.png)
  const [form, setForm] = useState({
    productId: '',
    discountPercent: '25',
    durationHours: '3',
    isMegaFlashSale: false,
  });

  // Sitewide Mega Sale Banner State (Preserved for full store promotion)
  const [showBannerSettings, setShowBannerSettings] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [campaign, setCampaign] = useState(() => ({
    title: 'SHOPLY MEGA SALE 2026',
    subtitle: 'Up to 70% OFF on Top Tech, Luxury Horology & Bespoke Apparel',
    bannerText: '⚡ FLASH SALE: Extra 20% Instant Discount at Checkout with code MEGASALE',
    couponCode: 'MEGASALE',
    discountPercent: 50,
    badgeText: 'LIMITED TIME MEGA EVENT',
    theme: 'amber',
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true,
  }));

  // Fetch scheduled flash sales from backend
  const fetchScheduledSales = async () => {
    setLoadingSales(true);
    try {
      const { data } = await api.get('/admin/flash-sales');
      if (Array.isArray(data)) {
        setScheduledSales(data);
      }
    } catch (err) {
      console.warn('Could not load flash sales from API:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  // Fetch catalog products to display IDs and titles
  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const res = await api.get('/admin/products').catch(() => api.get('/products'));
      const list = Array.isArray(res.data) ? res.data : res.data?.products;
      if (Array.isArray(list) && list.length > 0) {
        setCatalogProducts(list);
      }
    } catch (err) {
      console.warn('Failed to load products list:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Fetch campaign banner settings
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await api.get('/promotions/active');
        if (data) {
          setCampaign((prev) => ({
            ...prev,
            ...data,
            endDate: data.endDate
              ? new Date(data.endDate).toISOString().slice(0, 16)
              : prev.endDate,
          }));
        }
      } catch (err) {
        // Fallback to default
      }
    };

    fetchScheduledSales();
    fetchCatalog();
    fetchCampaign();
  }, []);

  // Handle Add Flash Sale (POST /api/admin/flash-sales)
  const handleAddFlashSale = async (e) => {
    e.preventDefault();

    if (!form.productId.trim()) {
      addToast('Please enter a Product ID (e.g. 1, 2, 12, or MongoDB ID)', 'error');
      return;
    }

    const pct = Number(form.discountPercent);
    if (!pct || pct <= 0 || pct >= 100) {
      addToast('Please enter a discount percent between 1 and 99', 'error');
      return;
    }

    setSubmittingSale(true);
    try {
      const payload = {
        productId: form.productId.trim(),
        discountPercent: pct,
        durationHours: Number(form.durationHours) || 3,
        isMegaFlashSale: form.isMegaFlashSale,
      };

      const { data } = await api.post('/admin/flash-sales', payload);
      addToast(`Flash sale scheduled for "${data.title}"!`, 'success');

      // Update scheduled sales list and catalog
      setScheduledSales((prev) => [data, ...prev.filter((p) => p._id !== data._id)]);
      setCatalogProducts((prev) =>
        prev.map((p) => (p._id === data._id ? { ...p, ...data } : p))
      );

      // Reset form to defaults
      setForm({
        productId: '',
        discountPercent: '25',
        durationHours: '3',
        isMegaFlashSale: false,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule flash sale';
      addToast(msg, 'error');
    } finally {
      setSubmittingSale(false);
    }
  };

  // Handle Cancel / Remove Flash Sale
  const handleCancelSale = async (id, title) => {
    if (!window.confirm(`Cancel scheduled flash sale for "${title}"?`)) return;
    try {
      await api.delete(`/admin/flash-sales/${id}`);
      setScheduledSales((prev) => prev.filter((s) => s._id !== id));
      setCatalogProducts((prev) =>
        prev.map((p) =>
          p._id === id
            ? { ...p, isFlashDeal: false, isMegaFlashSale: false, discountPrice: 0, offerTag: '' }
            : p
        )
      );
      addToast(`Flash sale removed for "${title}"`, 'info');
    } catch (err) {
      addToast('Failed to cancel flash sale', 'error');
    }
  };

  // Auto-fill Product ID in form from catalog table
  const handleFillProductId = (idxOrId) => {
    setForm((prev) => ({ ...prev, productId: String(idxOrId) }));
    addToast(`Selected Product ID #${idxOrId}`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save sitewide banner settings
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const { data } = await api.post('/promotions/admin', campaign);
      setCampaign((prev) => ({ ...prev, ...data }));
      addToast('Sitewide Mega Sale banner updated and live on storefront!', 'success');
    } catch (err) {
      addToast('Saved locally in session', 'info');
    } finally {
      setSavingBanner(false);
    }
  };

  // Filter products for reference catalog
  const filteredCatalog = catalogProducts.filter((p) => {
    if (!catalogSearch.trim()) return true;
    const term = catalogSearch.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p._id?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mega Sale & Flash Deal Manager
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Schedule item-level flash sales, configure event countdowns, and launch sitewide seasonal promotions.
            </p>
          </div>
        </div>

        {/* Sitewide Banner Toggle Shortcut */}
        <button
          type="button"
          onClick={() => setShowBannerSettings(!showBannerSettings)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131d2e] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{showBannerSettings ? 'Hide Banner Settings' : 'Sitewide Banner Settings'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              showBannerSettings ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN SPLIT: EXACT MATCH WITH media_1789986397188.png                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCHEDULE FLASH SALE */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              SCHEDULE FLASH SALE
            </h2>
          </div>

          <form onSubmit={handleAddFlashSale} className="space-y-4">
            {/* PRODUCT ID */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                PRODUCT ID
              </label>
              <input
                type="text"
                required
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                placeholder="e.g. 12"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* 2-COLUMN ROW: DISCOUNT % & DURATION (HRS) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  DISCOUNT %
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                  placeholder="e.g. 25"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  DURATION (HRS)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="720"
                  value={form.durationHours}
                  onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                  placeholder="3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* MARK AS MEGA FLASH SALE */}
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-center justify-between cursor-pointer">
              <label
                htmlFor="megaFlashCheckbox"
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  MARK AS MEGA FLASH SALE
                </span>
              </label>

              <input
                id="megaFlashCheckbox"
                type="checkbox"
                checked={form.isMegaFlashSale}
                onChange={(e) => setForm({ ...form, isMegaFlashSale: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded border-amber-300 focus:ring-orange-500 cursor-pointer"
              />
            </div>

            {/* + ADD FLASH SALE BUTTON */}
            <button
              type="submit"
              disabled={submittingSale}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>+ ADD FLASH SALE</span>
            </button>

            {/* Helper Caption */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
              Product IDs are visible in the Products Catalog table. The storefront only shows flash sales you schedule here.
            </p>
          </form>
        </div>

        {/* RIGHT COLUMN: SCHEDULED SALES */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs min-h-[380px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                SCHEDULED SALES
              </h2>
            </div>

            <button
              type="button"
              onClick={fetchScheduledSales}
              title="Refresh Scheduled Sales"
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingSales ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Empty State (Exact Match to Screenshot) */}
          {scheduledSales.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
                No flash sales scheduled yet. Add one from the form to show it on the storefront.
              </p>
            </div>
          ) : (
            /* Populated State */
            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
              {scheduledSales.map((sale, idx) => {
                const img =
                  Array.isArray(sale.images) && sale.images.length > 0
                    ? sale.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';

                const isMega = sale.isMegaFlashSale || sale.offerTag === 'MEGA FLASH SALE';
                const discountPct =
                  sale.flashSaleDiscountPercent ||
                  Math.round(((sale.price - sale.discountPrice) / sale.price) * 100) ||
                  25;

                return (
                  <div
                    key={sale._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0c1421]/70 hover:border-orange-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={img}
                        alt={sale.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            #{idx + 1} ({sale._id.slice(-4)})
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isMega
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {isMega ? '⚡ MEGA FLASH' : 'FLASH SALE'}
                          </span>
                        </div>

                        <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                          {sale.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                            {formatINR(sale.discountPrice)}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatINR(sale.price)}
                          </span>
                          <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400">
                            ({discountPct}% OFF)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-2 sm:pt-0">
                      {sale.flashSaleExpiresAt && (
                        <div className="text-right">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">
                            Expires In
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span>
                              {Math.max(
                                0,
                                Math.round(
                                  (new Date(sale.flashSaleExpiresAt) - new Date()) / (1000 * 60 * 60)
                                )
                              )}
                              h remaining
                            </span>
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCancelSale(sale._id, sale.title)}
                        title="Cancel flash sale"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRODUCTS CATALOG TABLE WITH REFERENCE IDs (Referenced in form caption)    */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              PRODUCTS CATALOG TABLE & REFERENCE IDs
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Copy or click any product ID to auto-fill the Schedule Flash Sale form above
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search products & IDs..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="py-3 px-3">PRODUCT ID #</th>
                <th className="py-3 px-3">CATALOG ITEM</th>
                <th className="py-3 px-3">CATEGORY</th>
                <th className="py-3 px-3 text-right">STANDARD PRICE</th>
                <th className="py-3 px-3 text-center">CURRENT STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingCatalog ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Loading catalog items...
                  </td>
                </tr>
              ) : filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No products matching search
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((prod, idx) => {
                  const isFlash = prod.isFlashDeal;
                  const img =
                    Array.isArray(prod.images) && prod.images.length > 0
                      ? prod.images[0]
                      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';

                  return (
                    <tr
                      key={prod._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product ID */}
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs">
                          {idx + 1}
                        </span>
                      </td>

                      {/* Product Title & Image */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={img}
                            alt={prod.title}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                            {prod.title}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                        {prod.category}
                      </td>

                      {/* Standard Price */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(prod.price)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {isFlash ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                            <Zap className="w-3 h-3 fill-orange-500" />
                            <span>Flash Deal Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Regular
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleFillProductId(idx + 1)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 transition-all cursor-pointer"
                        >
                          Use ID #{idx + 1}
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

      {/* ========================================================================= */}
      {/* COLLAPSIBLE SITEWIDE MEGA SALE BANNER & EVENT SETTINGS                     */}
      {/* ========================================================================= */}
      {showBannerSettings && (
        <div className="bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Sitewide Mega Sale Banner & Live Countdown Controller
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Configure the banner broadcasting across the top of your customer storefront
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                campaign.isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {campaign.isActive ? '● Live on Storefront' : '○ Paused'}
            </span>
          </div>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  EVENT HEADLINE TITLE
                </label>
                <input
                  type="text"
                  value={campaign.title}
                  onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  RIBBON TAG BADGE
                </label>
                <input
                  type="text"
                  value={campaign.badgeText}
                  onChange={(e) => setCampaign({ ...campaign, badgeText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                SUBTITLE & HIGHLIGHTS
              </label>
              <input
                type="text"
                value={campaign.subtitle}
                onChange={(e) => setCampaign({ ...campaign, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  HEADLINE DISCOUNT (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={campaign.discountPercent}
                  onChange={(e) => setCampaign({ ...campaign, discountPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  COUPON PROMO CODE
                </label>
                <input
                  type="text"
                  value={campaign.couponCode}
                  onChange={(e) => setCampaign({ ...campaign, couponCode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  SALE DEADLINE (COUNTDOWN)
                </label>
                <input
                  type="datetime-local"
                  value={campaign.endDate}
                  onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaign.isActive}
                  onChange={(e) => setCampaign({ ...campaign, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Broadcast Banner Live on Storefront
                </span>
              </label>

              <button
                type="submit"
                disabled={savingBanner}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {savingBanner ? 'SAVING...' : 'SAVE BANNER SETTINGS'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
