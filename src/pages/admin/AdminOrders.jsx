import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import {
  FileText,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Search,
  X,
  Filter,
} from 'lucide-react';
import { InvoiceModal } from '../../components/order/InvoiceModal';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order #${orderId.slice(-6)} status updated to ${newStatus}`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating order', 'error');
    }
  };

  // Pre-calculated counts for badges
  const processingCount = useMemo(
    () => orders.filter((o) => o.status === 'Processing').length,
    [orders]
  );
  const shippedCount = useMemo(
    () => orders.filter((o) => o.status === 'Shipped').length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'Delivered').length,
    [orders]
  );
  const cancelledCount = useMemo(
    () => orders.filter((o) => o.status === 'Cancelled').length,
    [orders]
  );

  // Status Filter Tabs
  const filterTabs = [
    {
      id: 'all',
      label: 'All Orders',
      count: orders.length,
      icon: Package,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
      activeClass: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm',
    },
    {
      id: 'Processing',
      label: 'Processing',
      count: processingCount,
      icon: Clock,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400',
      activeClass: 'bg-amber-500 text-slate-950 font-black shadow-sm',
    },
    {
      id: 'Shipped',
      label: 'Shipped',
      count: shippedCount,
      icon: Truck,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400',
      activeClass: 'bg-indigo-600 text-white shadow-sm',
    },
    {
      id: 'Delivered',
      label: 'Delivered',
      count: deliveredCount,
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400',
      activeClass: 'bg-emerald-600 text-white shadow-sm',
    },
    {
      id: 'Cancelled',
      label: 'Cancelled',
      count: cancelledCount,
      icon: XCircle,
      badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400',
      activeClass: 'bg-rose-600 text-white shadow-sm',
    },
  ];

  // Filtered orders collection
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const orderIdMatch = order._id?.toLowerCase().includes(q);
        const buyerNameMatch = (order.user?.name || order.shippingAddress?.fullName || '')
          .toLowerCase()
          .includes(q);
        const emailMatch = (order.user?.email || '').toLowerCase().includes(q);
        const itemMatch = order.orderItems?.some((i) =>
          i.title?.toLowerCase().includes(q)
        );
        if (!orderIdMatch && !buyerNameMatch && !emailMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
          Global Logistics
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Platform Orders
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Monitor customer transactions and manage global fulfillment dispatch statuses.
        </p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-black/20 text-current'
                      : tab.badgeColor
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, name, item..."
            className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {statusFilter === 'all'
                  ? 'No orders recorded yet'
                  : `No "${statusFilter}" orders found`}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : statusFilter !== 'all'
                  ? 'There are currently no orders under this status filter'
                  : 'New orders will appear here once placed by buyers'}
              </p>
            </div>
            {(statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-4 px-5">Order ID</th>
                  <th className="py-4 px-4">Collector / Buyer</th>
                  <th className="py-4 px-4">Items Count</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-5">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredOrders.map((order) => {
                  // Dynamic status color indicator
                  const statusColors = {
                    Processing:
                      'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
                    Shipped:
                      'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
                    Delivered:
                      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
                    Cancelled:
                      'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
                  };

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {order.user?.name || 'Guest'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.user?.email}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {order.orderItems?.reduce((acc, i) => acc + i.qty, 0)} item(s)
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                        {formatINR(order.totalPrice)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            order.isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          {order.paymentMethod} {order.isPaid ? '· Paid' : '· Unpaid'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`border text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:border-slate-500 cursor-pointer shadow-2xs transition-colors ${
                              statusColors[order.status] ||
                              'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="View and download tax bill"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </div>
  );
};
