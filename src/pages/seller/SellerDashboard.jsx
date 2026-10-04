import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Boxes,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '../../utils/format';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerStats = async () => {
      try {
        const { data } = await api.get('/seller/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load seller stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Artisan Merchant Studio
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            {user?.shopName || 'Merchant Command'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Track revenue, inventory velocity, and fulfill customer acquisitions.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards - Responsive 2-Col Mobile, 4-Col Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 sm:mb-4">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Merchant Revenue</p>
          </div>
          <p className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate" title={formatINR(stats?.totalRevenue)}>
            {formatINR(stats?.totalRevenue)}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 sm:mb-4">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Total Orders</p>
          </div>
          <p className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 sm:mb-4">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Vault Listings</p>
          </div>
          <p className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5 sm:mb-4">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Units Dispatched</p>
          </div>
          <p className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.unitsSold || 0}</p>
        </div>
      </div>

      {/* Catalog Listing Governance & Approval Status */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Catalog Listings & Moderation Pipeline</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track live storefront items and those undergoing administrator verification.
            </p>
          </div>
          <Link
            to="/seller/products"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Manage Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs">
          {/* Approved */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-emerald-950 dark:text-emerald-300 truncate">Live on Storefront</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">Approved & Shoppable</p>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-300 ml-2 shrink-0">
              {stats?.approvedProducts ?? stats?.totalProducts ?? 0}
            </span>
          </div>

          {/* Pending */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-amber-950 dark:text-amber-300 truncate">Pending Admin Review</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate">Awaiting Approval</p>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-300 ml-2 shrink-0">
              {stats?.pendingProducts ?? 0}
            </span>
          </div>

          {/* Rejected */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-rose-950 dark:text-rose-300 truncate">Needs Revision</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 truncate">Rejected Listings</p>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-black text-rose-800 dark:text-rose-300 ml-2 shrink-0">
              {stats?.rejectedProducts ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Banner */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {stats?.pendingOrdersCount || 0} Orders Awaiting Packing & Dispatch
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ensure rapid shipping to maintain your certified seller tier status.
            </p>
          </div>
        </div>

        <Link
          to="/seller/orders"
          className="w-full sm:w-auto text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          View Pending Orders
        </Link>
      </div>
    </div>
  );
};
