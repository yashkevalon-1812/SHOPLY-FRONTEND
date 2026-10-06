import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MapPin, Calendar, FileText } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';
import { InvoiceModal } from '../../components/order/InvoiceModal';

export const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
          Fulfillment Queue
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Incoming Orders</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Review customer purchases containing your catalog pieces and update dispatch statuses.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs rounded-2xl sm:rounded-3xl font-medium shadow-sm transition-colors">
            No incoming orders currently require your attention.
          </div>
        ) : (
          orders.map((order) => {
            const myItems = order.orderItems.filter(
              (item) => item.seller && item.seller.toString() === user._id.toString()
            );

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      #{order._id.slice(-6)}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
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
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fulfillment Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-slate-500 cursor-pointer shadow-2xs"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
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
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">Quantity: {item.qty}</p>
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
