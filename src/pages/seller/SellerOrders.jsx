import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Calendar,
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
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';
import { InvoiceModal } from '../../components/order/InvoiceModal';

export const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchSellerOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/seller/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load merchant orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order #${orderId.slice(-6)} set to ${newStatus}`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating status', 'error');
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
        const buyerNameMatch = (order.shippingAddress?.fullName || '').toLowerCase().includes(q);
        const phoneMatch = (order.shippingAddress?.phone || '').toLowerCase().includes(q);
        const itemMatch = order.orderItems?.some((i) =>
          i.title?.toLowerCase().includes(q)
        );
        if (!orderIdMatch && !buyerNameMatch && !phoneMatch && !itemMatch) {
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
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
          Fulfillment Queue
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Incoming Orders
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Review customer purchases containing your catalog pieces and update dispatch statuses.
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
            placeholder="Search Order ID, buyer, item..."
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

      {/* Orders List Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 rounded-2xl sm:rounded-3xl shadow-sm transition-colors">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {statusFilter === 'all'
                  ? 'No incoming orders currently require your attention'
                  : `No "${statusFilter}" orders found`}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : statusFilter !== 'all'
                  ? 'There are currently no orders in this status category'
                  : 'New orders containing your products will appear here once purchased'}
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
          filteredOrders.map((order) => {
            const myItems = order.orderItems.filter(
              (item) => item.seller && item.seller.toString() === user._id.toString()
            );

            // Dynamic status badges
            const statusBadgeColors = {
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
              <div
                key={order._id}
                className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          #{order._id.slice(-6)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            statusBadgeColors[order.status] ||
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 hover:underline transition-colors cursor-pointer mr-1"
                      title="View tax invoice bill"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Bill</span>
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Fulfillment Status:
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className={`border text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:border-slate-500 cursor-pointer shadow-2xs transition-colors ${
                        statusBadgeColors[order.status] ||
                        'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items to ship */}
                <div className="space-y-3">
                  {myItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                        onError={(e) => handleImageError(e, item.image)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Quantity: {item.qty}
                        </p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatINR(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping address info */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 border border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold block">
                      Deliver to: {order.shippingAddress?.fullName} ({order.shippingAddress?.phone})
                    </span>
                    <span>
                      {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                      {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Bill Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </div>
  );
};
