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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">
            {formatINR(stats?.totalRevenue)}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Total Orders</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Active Listings</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Total Users</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-3">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Registered Sellers</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalSellers || 0}</p>
        </div>

        <div className="bg-white border border-amber-300 p-5 rounded-2xl shadow-xs bg-gradient-to-br from-amber-50/50 to-white">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold text-amber-800">Pending Sellers</p>
          <p className="text-2xl font-black text-amber-900 mt-0.5">
            {stats?.pendingSellers || 0}
          </p>
        </div>
      </div>

      {/* Pending Product Reviews Alert Banner */}
      {stats?.pendingProductsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-5 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-950">
                {stats.pendingProductsCount} Seller Listing{stats.pendingProductsCount > 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-xs text-slate-900/80 font-medium">
                Merchants have submitted new listings that are held in queue until approved by administration.
              </p>
            </div>
          </div>
          <Link
            to="/admin/seller-products"
            className="bg-slate-950 text-amber-400 hover:bg-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 shadow-sm transition-all hover:scale-105"
          >
            Review Products Now →
          </Link>
        </div>
      )}

      {/* Pending Sellers Quick Approval Widget */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Pending Merchant Applications ({stats?.pendingSellerList?.length || 0})
            </h2>
          </div>
          <Link
            to="/admin/sellers"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.pendingSellerList && stats.pendingSellerList.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.pendingSellerList.map((seller) => (
              <div
                key={seller._id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {seller.shopName || seller.name}
                    </span>
                    <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Pending Action
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Owner: {seller.name} · {seller.email} {seller.phone && `· ${seller.phone}`}
                  </p>
                  {seller.storeDescription && (
                    <p className="text-slate-600 italic mt-1 max-w-xl text-[11px]">
                      "{seller.storeDescription}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleQuickStatusUpdate(seller._id, 'active')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Activate</span>
                  </button>

                  <button
                    onClick={() => handleQuickStatusUpdate(seller._id, 'rejected')}
                    className="flex items-center gap-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 px-3.5 py-1.5 rounded-xl transition-all text-xs font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 font-medium">
            No merchant applications are currently awaiting clearance. All sellers are actively processed.
          </p>
        )}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Inspect All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Collector</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-3 font-mono text-slate-700 font-bold">#{order._id.slice(-6)}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{order.user?.name || 'Guest'}</td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{order.paymentMethod}</td>
                  <td className="py-3.5 px-3 font-black text-slate-900">
                    {formatINR(order.totalPrice)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'Shipped'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
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
