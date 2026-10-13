import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Radio,
  Send,
  Bell,
  Users,
  ShoppingBag,
  Store,
  Tag,
  Sparkles,
  AlertTriangle,
  Info,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ChevronRight,
  Flame,
  Copy,
  Layers,
} from 'lucide-react';

const TITLE_TEMPLATES = [
  { label: '⚡ Flash Sale Drop', text: '⚡ Limited-Time Flash Sale is Live Now!' },
  { label: '📢 Announcement', text: '📢 Important Update: Shoply Spring 2026 Collection' },
  { label: '🎁 Promo Voucher', text: '🎁 Special 20% Voucher Unlocked for Your Cart' },
  { label: '🛍️ New Arrival', text: '🛍️ Discover Artisan Horology & Audio Vault Drops' },
  { label: '⚠️ Notice', text: '⚠️ Scheduled System Optimization & Store Upgrades' },
];

const QUICK_LINKS = [
  { label: 'Store Catalog', url: '/shop' },
  { label: 'Flash Deals & Offers', url: '/offers' },
  { label: 'Seller Vault', url: '/seller/products' },
  { label: 'Discounts & Campaigns', url: '/seller/coupons' },
  { label: 'Customer Orders', url: '/orders' },
];

export const AdminBroadcast = () => {
  const { addToast } = useToast();

  const [broadcasts, setBroadcasts] = useState([]);
  const [stats, setStats] = useState({
    totalBroadcasts: 0,
    totalReads: 0,
    audienceStats: { all: 0, buyers: 0, sellers: 0, user: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');

  // Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement', // announcement | offer | system | alert
    priority: 'normal', // normal | high | urgent
    targetAudience: 'all', // all | buyers | sellers
    link: '',
  });

  const fetchBroadcastHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/admin');
      setBroadcasts(data.notifications || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
      addToast('Failed to load broadcast history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcastHistory();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      addToast('Please enter a notification headline', 'error');
      return;
    }

    if (!form.message.trim()) {
      addToast('Please enter the notification message body', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        priority: form.priority,
        targetAudience: form.targetAudience,
        link: form.link.trim(),
      };

      const { data } = await api.post('/notifications/admin', payload);

      addToast(
        `Broadcast sent successfully to ${
          form.targetAudience === 'all'
            ? 'All Users'
            : form.targetAudience === 'buyers'
            ? 'Buyers Only'
            : 'Sellers Only'
        }!`,
        'success'
      );

      // Prepend to list
      setBroadcasts((prev) => [data, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalBroadcasts: prev.totalBroadcasts + 1,
        audienceStats: {
          ...prev.audienceStats,
          [form.targetAudience]: (prev.audienceStats[form.targetAudience] || 0) + 1,
        },
      }));

      // Reset form
      setForm({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        targetAudience: 'all',
        link: '',
      });
    } catch (err) {
      console.error('Broadcast dispatch failed:', err);
      addToast(err.response?.data?.message || 'Failed to dispatch broadcast', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id, title) => {
    if (!window.confirm(`Delete broadcast: "${title}"?`)) return;

    try {
      await api.delete(`/notifications/admin/${id}`);
      setBroadcasts((prev) => prev.filter((b) => b._id !== id));
      addToast('Broadcast removed from records', 'info');
    } catch (err) {
      console.error('Delete broadcast error:', err);
      addToast('Failed to delete broadcast', 'error');
    }
  };

  const handleDuplicate = (b) => {
    setForm({
      title: b.title || '',
      message: b.message || '',
      type: b.type || 'announcement',
      priority: b.priority || 'normal',
      targetAudience: b.targetAudience || 'all',
      link: b.link || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('Broadcast loaded into composer', 'info');
  };

  // Filtered broadcast history
  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesAudience = audienceFilter === 'all' || b.targetAudience === audienceFilter;
    const matchesQuery =
      !searchFilter.trim() ||
      b.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.message?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesAudience && matchesQuery;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'offer':
        return {
          label: 'OFFER',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
          icon: Tag,
        };
      case 'alert':
        return {
          label: 'ALERT',
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
          icon: AlertTriangle,
        };
      case 'system':
        return {
          label: 'SYSTEM',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/60',
          icon: Info,
        };
      case 'announcement':
      default:
        return {
          label: 'ANNOUNCEMENT',
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
          icon: Radio,
        };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500 text-white font-black';
      case 'high':
        return 'bg-amber-500 text-white font-bold';
      case 'normal':
      default:
        return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold';
    }
  };

  const getAudienceLabel = (aud) => {
    switch (aud) {
      case 'buyers':
        return { label: 'Buyers Only', icon: ShoppingBag, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60' };
      case 'sellers':
        return { label: 'Sellers Only', icon: Store, color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' };
      case 'all':
      default:
        return { label: 'All Users', icon: Users, color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60' };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 sm:p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Platform Communication Terminal
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Notification Broadcast Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Dispatch instant notifications, flash drops, or platform advisories to buyers and merchants.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBroadcastHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Log</span>
        </button>
      </div>

      {/* Metric Cards - Responsive 2-Col Mobile, 4-Col Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Broadcasts */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between min-w-0 gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">
              Total Broadcasts
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.totalBroadcasts}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Storewide Community Reach */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between min-w-0 gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">
              All Users Reach
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.audienceStats?.all || 0}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Seller Studio Targeted */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between min-w-0 gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">
              Merchant Specific
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.audienceStats?.sellers || 0}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Reads */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between min-w-0 gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">
              Read Receipts
            </p>
            <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.totalReads}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN: COMPOSE & DISPATCH BROADCAST
           ========================================================================= */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
          <div className="pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                COMPOSE NEW BROADCAST
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Draft reactive notifications with deep-links and audience scoping
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 sm:space-y-5">
            {/* Template Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 sm:mb-2">
                QUICK HEADLINE PRESETS
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {TITLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => setForm({ ...form, title: tmpl.text })}
                    className="text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  NOTIFICATION HEADLINE
                </label>
                <span className="text-xs text-slate-400 font-medium">{form.title.length}/120</span>
              </div>
              <input
                type="text"
                required
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. ⚡ Flash Drop: Luxury Watch Editions Now 20% OFF"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  MESSAGE BODY
                </label>
                <span className="text-xs text-slate-400 font-medium">{form.message.length}/500</span>
              </div>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write the notification message displayed to users..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 sm:mb-2">
                TARGET AUDIENCE SCOPE
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { id: 'all', label: 'All Users', icon: Users, desc: 'Storewide' },
                  { id: 'buyers', label: 'Buyers Only', icon: ShoppingBag, desc: 'Shoppers' },
                  { id: 'sellers', label: 'Sellers Only', icon: Store, desc: 'Merchants' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setForm({ ...form, targetAudience: aud.id })}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      form.targetAudience === aud.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#0c1421] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <aud.icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${form.targetAudience === aud.id ? 'text-white' : 'text-slate-400'}`} />
                    <p className="text-xs sm:text-sm font-bold leading-tight">{aud.label}</p>
                    <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${form.targetAudience === aud.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {aud.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  NOTIFICATION TYPE
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="offer">⚡ Promotion & Offer</option>
                  <option value="system">🛡️ System Update</option>
                  <option value="alert">⚠️ Urgent Alert</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  DELIVERY URGENCY
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="normal">Standard (Normal)</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Breaking</option>
                </select>
              </div>
            </div>

            {/* Action / Redirect Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                DESTINATION ACTION URL (OPTIONAL)
              </label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="e.g. /shop or /offers or /seller/coupons"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_LINKS.map((ql) => (
                  <button
                    key={ql.url}
                    type="button"
                    onClick={() => setForm({ ...form, link: ql.url })}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    +{ql.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE DEVICE NOTIFICATION CARD PREVIEW */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                LIVE CUSTOMER BELL DRAWER PREVIEW
              </span>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${
                        getTypeBadge(form.type).bg
                      }`}
                    >
                      {getTypeBadge(form.type).label}
                    </span>
                    {form.priority !== 'normal' && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityBadge(form.priority)}`}>
                        {form.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" /> Just now
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {form.title.trim() || 'Sample Notification Headline'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                    {form.message.trim() ||
                      'This is how the broadcast notification preview will render inside the customer navigation drawer...'}
                  </p>
                </div>

                {form.link && (
                  <div className="pt-1 flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <span>Target: {form.link}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${submitting ? 'animate-bounce' : ''}`} />
              <span>{submitting ? 'DISPATCHING TO USERS...' : 'DISPATCH BROADCAST'}</span>
            </button>
          </form>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: BROADCAST DISPATCH HISTORY & AUDIT LOG
           ========================================================================= */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131d2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                BROADCAST LOG & DISPATCH HISTORY
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                Track previous broadcasts, delivery scope, and user read engagement
              </p>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 dark:bg-[#0c1421] p-1 rounded-xl text-xs sm:text-sm font-bold w-full sm:w-auto">
              {['all', 'buyers', 'sellers'].map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setAudienceFilter(aud)}
                  className={`px-3 py-1.5 rounded-lg capitalize text-center transition-all ${
                    audienceFilter === aud
                      ? 'bg-white dark:bg-[#131d2e] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search previous broadcasts by title or content..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1421] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* Broadcasts List */}
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading broadcast history...
            </div>
          ) : filteredBroadcasts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Radio className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No Broadcasts Found
              </p>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                No notifications match your current filter. Compose a message on the left to broadcast to users.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredBroadcasts.map((b) => {
                const aud = getAudienceLabel(b.targetAudience);
                const typ = getTypeBadge(b.type);
                const readCount = b.readBy ? b.readBy.length : 0;
                const formattedDate = new Date(b.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={b._id}
                    className="p-3.5 sm:p-4.5 rounded-xl bg-slate-50/70 dark:bg-[#0c1421]/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5 sm:space-y-3"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border ${typ.bg}`}
                        >
                          <typ.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>{typ.label}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border ${aud.color}`}
                        >
                          <aud.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>{aud.label}</span>
                        </span>

                        {b.priority !== 'normal' && (
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${getPriorityBadge(b.priority)}`}>
                            {b.priority.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/40 dark:border-slate-800/40">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Duplicate Button */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(b)}
                            title="Copy details into composer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBroadcast(b._id, b.title)}
                            title="Delete broadcast record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {b.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 sm:mt-1.5 leading-relaxed">
                        {b.message}
                      </p>
                    </div>

                    {/* Card Footer: Engagement & Links */}
                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {readCount} user{readCount === 1 ? '' : 's'} read
                        </span>
                        {b.sentBy?.name && (
                          <span className="truncate">Dispatched by: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{b.sentBy.name}</strong></span>
                        )}
                      </div>

                      {b.link && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 truncate">
                          <span>Link: {b.link}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;
