import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/format';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-zinc-200 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Account Dashboard
          </span>
          <h1 className="text-3xl font-black text-zinc-950 mt-1">
            My Collector Acquisitions
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Review live fulfillment progress, track shipments, and inspect order receipts.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">No Acquisitions Yet</h3>
            <p className="text-xs text-zinc-500 mb-6">
              You haven't placed any orders yet. Discover our latest catalog pieces today.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs"
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
                  className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-zinc-950">
                          #{order._id}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'Shipped'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-zinc-400 block">Total Investment</span>
                      <span className="text-base font-black text-zinc-950">
                        {formatINR(order.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {step !== -1 && (
                    <div className="py-2">
                      <div className="grid grid-cols-3 text-center text-xs relative">
                        {/* Connecting Line */}
                        <div className="absolute top-3 left-[16%] right-[16%] h-0.5 bg-zinc-200 -z-0">
                          <div
                            className="h-full bg-zinc-950 transition-all duration-500"
                            style={{
                              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                            }}
                          ></div>
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step >= 1 ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-500'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-800">Processing</span>
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step >= 2 ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-500'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-800">Shipped</span>
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step >= 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-500'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-800">Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="space-y-3 border-t border-zinc-100 pt-4">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-50 border border-zinc-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 truncate">{item.title}</h4>
                          <p className="text-zinc-500 text-[11px]">Quantity: {item.qty}</p>
                        </div>
                        <span className="font-black text-zinc-950">
                          {formatINR(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping and Payment Footer */}
                  <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-600 flex flex-col sm:flex-row justify-between gap-3 border border-zinc-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <span>
                        Shipping to {order.shippingAddress?.fullName},{' '}
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-500 shrink-0" />
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
