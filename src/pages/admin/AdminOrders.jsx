import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
          Global Logistics
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Platform Orders</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Monitor customer transactions and manage global fulfillment dispatch statuses.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">No orders recorded yet.</div>
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
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-white">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{order.user?.name || 'Guest'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{order.user?.email}</p>
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
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-slate-500 cursor-pointer shadow-2xs"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
