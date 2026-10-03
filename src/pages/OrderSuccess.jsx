import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/format';

export const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 text-center shadow-xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
          Order Confirmed & Allocated
        </span>
        <h1 className="text-3xl font-black text-zinc-950 mt-1 mb-3">
          Thank You For Your Acquisition
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-8">
          Your order reference <strong className="text-zinc-950 font-mono">#{id}</strong> has been logged. Our dispatch team is preparing your insured parcel.
        </p>

        {order && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-left text-xs space-y-4 mb-8">
            <div className="flex justify-between border-b border-zinc-200 pb-3">
              <span className="text-zinc-500">Status</span>
              <span className="font-bold text-amber-700 uppercase tracking-wide">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-3">
              <span className="text-zinc-500">Recipient</span>
              <span className="font-bold text-zinc-900">{order.shippingAddress?.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-3">
              <span className="text-zinc-500">Destination</span>
              <span className="font-medium text-zinc-800">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-3">
              <span className="text-zinc-500">Payment Authorization</span>
              <span className="font-medium text-zinc-800">
                {order.paymentMethod} {order.isPaid ? '(Paid)' : '(Pending at Delivery)'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1">
              <span className="text-zinc-950">Total Amount</span>
              <span className="text-zinc-950">{formatINR(order.totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>Track in My Orders</span>
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs py-3 px-6 rounded-xl transition-colors border border-zinc-200"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
