import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { handleImageError } from '../utils/imageHelper';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { addToast } = useToast();

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? The order will be cancelled and items restocked.')) {
      return;
    }
    setCancellingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`);
      addToast(data.message || 'Order cancelled successfully!', 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch (err) {
        console.error('Failed to load user orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStep = (status) => {
    switch (status) {
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] transition-colors">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0b1120] text-zinc-900 dark:text-slate-100 min-h-screen py-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-zinc-200 dark:border-slate-800 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Account Dashboard
          </span>
          <h1 className="text-3xl font-black text-zinc-950 dark:text-white mt-1">
            My Collector Acquisitions
          </h1>
          <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1 font-medium">
            Review live fulfillment progress, track shipments, and inspect order receipts.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 flex items-center justify-center text-zinc-400 dark:text-slate-500 mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No Acquisitions Yet</h3>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mb-6">
              You haven't placed any orders yet. Discover our latest catalog pieces today.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const step = getStatusStep(order.status);
              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                          #{order._id}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : order.status === 'Shipped'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                      <span className="text-[11px] text-zinc-400 block">Total Investment</span>
                      <span className="text-base font-black text-zinc-950 dark:text-white">
                        {formatINR(order.totalPrice)}
                      </span>
                      {order.status === 'Processing' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="mt-2 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 inline-flex items-center gap-1 hover:underline transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3 h-3" />
                          <span>{cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {step !== -1 && (
                    <div className="py-2">
                      <div className="grid grid-cols-3 text-center text-xs relative">
                        {/* Connecting Line */}
                        <div className="absolute top-3 left-[16%] right-[16%] h-0.5 bg-zinc-200 dark:bg-slate-700 -z-0">
                          <div
                            className="h-full bg-zinc-950 dark:bg-amber-500 transition-all duration-500"
                            style={{
                              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                            }}
                          ></div>
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step >= 1 ? 'bg-zinc-950 dark:bg-amber-500 text-white dark:text-slate-950' : 'bg-zinc-200 dark:bg-slate-800 text-zinc-500'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-slate-200">Processing</span>
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step >= 2 ? 'bg-zinc-950 dark:bg-amber-500 text-white dark:text-slate-950' : 'bg-zinc-200 dark:bg-slate-800 text-zinc-500'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-slate-200">Shipped</span>
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step >= 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-slate-800 text-zinc-500'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-slate-200">Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="space-y-3 border-t border-zinc-100 dark:border-slate-800 pt-4">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 shrink-0"
                          onError={(e) => handleImageError(e, item.image)}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-white truncate">{item.title}</h4>
                          <p className="text-zinc-500 dark:text-slate-400 text-[11px]">Quantity: {item.qty}</p>
                        </div>
                        <span className="font-black text-zinc-950 dark:text-white">
                          {formatINR(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping and Payment Footer */}
                  <div className="bg-zinc-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs text-zinc-600 dark:text-slate-300 flex flex-col sm:flex-row justify-between gap-3 border border-zinc-200 dark:border-slate-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-zinc-500 dark:text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        Shipping to {order.shippingAddress?.fullName},{' '}
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-500 dark:text-slate-400 shrink-0" />
                      <span>
                        {order.paymentMethod} {order.isPaid ? '(Paid)' : '(Unpaid)'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
