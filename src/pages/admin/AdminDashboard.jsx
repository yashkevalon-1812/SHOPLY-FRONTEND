import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  Store,
  Clock,
  Check,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatINR } from '../../utils/format';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleQuickStatusUpdate = async (sellerId, newStatus) => {
    try {
      await api.put(`/admin/sellers/${sellerId}/status`, { status: newStatus });
      addToast(`Seller account status updated to ${newStatus}`, 'success');
      loadStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

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
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
          Global Marketplace Intelligence
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Platform Command Overview</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Monitor transaction volume, moderation alerts, and incoming merchant approval requests.
        </p>
      </div>

      {/* KPI Stats Grid - Responsive 2-Col Mobile, 3-Col Tablet, 6-Col Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4.5 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 sm:mb-3">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Total Revenue</p>
          </div>
          <p className="text-base sm:text-xl xl:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate" title={formatINR(stats?.totalRevenue)}>
            {formatINR(stats?.totalRevenue)}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4.5 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 sm:mb-3">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Total Orders</p>
          </div>
          <p className="text-base sm:text-xl xl:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4.5 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 sm:mb-3">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Active Listings</p>
          </div>
          <p className="text-base sm:text-xl xl:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4.5 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 sm:mb-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Total Users</p>
          </div>
          <p className="text-base sm:text-xl xl:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4.5 rounded-2xl shadow-xs transition-colors flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2 sm:mb-3">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Registered Sellers</p>
          </div>
          <p className="text-base sm:text-xl xl:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats?.totalSellers || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-amber-300 dark:border-amber-700/60 p-3.5 sm:p-4.5 rounded-2xl shadow-xs bg-gradient-to-br from-amber-50/50 dark:from-amber-950/30 to-white dark:to-[#0c1427] flex flex-col justify-between min-w-0">
          <div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2 sm:mb-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-300 truncate">Pending Sellers</p>
          </div>
          <p className="text-base sm:text-xl xl:text-2xl font-black text-amber-900 dark:text-amber-200 mt-1 truncate">
            {stats?.pendingSellers || 0}
          </p>
        </div>
      </div>

      {/* Pending Product Reviews Alert Banner */}
      {stats?.pendingProductsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-md">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base text-slate-950 truncate">
                {stats.pendingProductsCount} Seller Listing{stats.pendingProductsCount > 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-900/80 font-medium">
                Merchants have submitted listings held in queue until approved by administration.
              </p>
            </div>
          </div>
          <Link
            to="/admin/seller-products"
            className="w-full sm:w-auto text-center bg-slate-950 text-amber-400 hover:bg-slate-900 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 shadow-sm transition-all hover:scale-102"
          >
            Review Products Now →
          </Link>
        </div>
      )}

      {/* Pending Sellers Quick Approval Widget */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Pending Merchant Applications ({stats?.pendingSellerList?.length || 0})
            </h2>
          </div>
          <Link
            to="/admin/sellers"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.pendingSellerList && stats.pendingSellerList.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {stats.pendingSellerList.map((seller) => (
              <div
                key={seller._id}
                className="py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {seller.shopName || seller.name}
                    </span>
                    <span className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Pending Action
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                    Owner: {seller.name} · {seller.email} {seller.phone && `· ${seller.phone}`}
                  </p>
                  {seller.storeDescription && (
                    <p className="text-slate-600 dark:text-slate-400 italic mt-1 max-w-xl text-[11px] line-clamp-2">
                      "{seller.storeDescription}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => handleQuickStatusUpdate(seller._id, 'active')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleQuickStatusUpdate(seller._id, 'rejected')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-rose-50 text-rose-700 dark:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-200 px-3.5 py-2 rounded-xl transition-all text-xs font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-4 font-medium">
            No merchant applications are currently awaiting clearance. All sellers are actively processed.
          </p>
        )}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Inspect All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[580px]">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Collector</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300 font-bold">#{order._id.slice(-6)}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{order.user?.name || 'Guest'}</td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{order.paymentMethod}</td>
                  <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">
                    {formatINR(order.totalPrice)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          : order.status === 'Shipped'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                          : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
