import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Check, X, Clock, RefreshCw } from 'lucide-react';

export const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { addToast } = useToast();

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/sellers?status=${filterStatus}`);
      setSellers(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load merchant accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [filterStatus]);

  const handleUpdateStatus = async (sellerId, newStatus, shopName) => {
    try {
      await api.put(`/admin/sellers/${sellerId}/status`, { status: newStatus });
      addToast(
        `Merchant "${shopName || 'Seller'}" is now set to ${newStatus.toUpperCase()}`,
        'success'
      );
      setSellers((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, sellerStatus: newStatus } : s))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
            Governance & Curation
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Merchant Accounts & Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review incoming artisan registration credentials, authorize merchant privileges, or suspend non-compliant sellers.
          </p>
        </div>

        <button
          onClick={fetchSellers}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: 'All Merchants' },
          { id: 'pending', label: 'Pending Approval', badge: sellers.filter(s => s.sellerStatus === 'pending').length },
          { id: 'active', label: 'Active & Verified' },
          { id: 'rejected', label: 'Suspended / Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.id === 'pending' && tab.badge > 0 && (
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table of Sellers */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            No merchant accounts found under the "{filterStatus}" criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-4 px-5">Shop / Workshop</th>
                  <th className="py-4 px-4">Artisan Contact</th>
                  <th className="py-4 px-4">Specialty & Description</th>
                  <th className="py-4 px-4">Registration</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Shop */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                          {seller.shopName ? seller.shopName.charAt(0) : 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {seller.shopName || `${seller.name}'s Studio`}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {seller._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{seller.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{seller.email}</p>
                      {seller.phone && <p className="text-slate-500 dark:text-slate-400 text-[11px]">{seller.phone}</p>}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-600 text-[11px] line-clamp-2">
                        {seller.storeDescription || 'No workshop description submitted.'}
                      </p>
                    </td>

                    {/* Registered Date */}
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          seller.sellerStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : seller.sellerStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {seller.sellerStatus === 'active' && <Check className="w-3 h-3" />}
                        {seller.sellerStatus === 'pending' && <Clock className="w-3 h-3" />}
                        {seller.sellerStatus === 'rejected' && <X className="w-3 h-3" />}
                        <span>{seller.sellerStatus}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {seller.sellerStatus !== 'active' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(seller._id, 'active', seller.shopName)
                            }
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all text-xs"
                            title="Approve & Activate Seller"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Active</span>
                          </button>
                        )}

                        {seller.sellerStatus !== 'rejected' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(seller._id, 'rejected', seller.shopName)
                            }
                            className="flex items-center gap-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold"
                            title="Reject or Suspend Seller"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {seller.sellerStatus !== 'pending' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(seller._id, 'pending', seller.shopName)
                            }
                            className="text-[11px] text-slate-500 hover:text-slate-900 underline px-1 font-medium"
                          >
                            Set Pending
                          </button>
                        )}
                      </div>
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
