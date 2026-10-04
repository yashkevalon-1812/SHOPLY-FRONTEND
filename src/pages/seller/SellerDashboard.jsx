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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Merchant Revenue</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(stats?.totalRevenue)}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Total Customer Orders</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Active Vault Listings</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
            <Boxes className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Units Dispatched</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.unitsSold || 0}</p>
        </div>
      </div>

      {/* Catalog Listing Governance & Approval Status */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Catalog Listings & Moderation Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track which items are active on the website and which are undergoing administrator verification.
            </p>
          </div>
          <Link
            to="/seller/products"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Approved */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-950">Live on Storefront</p>
                <p className="text-[11px] text-emerald-700">Approved & Shoppable</p>
              </div>
            </div>
            <span className="text-xl font-black text-emerald-800">
              {stats?.approvedProducts ?? stats?.totalProducts ?? 0}
            </span>
          </div>

          {/* Pending */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-amber-950">Pending Admin Review</p>
                <p className="text-[11px] text-amber-700">Awaiting Approval</p>
              </div>
            </div>
            <span className="text-xl font-black text-amber-800">
              {stats?.pendingProducts ?? 0}
            </span>
          </div>

          {/* Rejected */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-rose-950">Needs Revision</p>
                <p className="text-[11px] text-rose-700">Rejected Listings</p>
              </div>
            </div>
            <span className="text-xl font-black text-rose-800">
              {stats?.rejectedProducts ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {stats?.pendingOrdersCount || 0} Orders Awaiting Packing & Dispatch
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure rapid shipping to maintain your certified seller tier status.
            </p>
          </div>
        </div>

        <Link
          to="/seller/orders"
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          View Pending Orders
        </Link>
      </div>
    </div>
  );
};
