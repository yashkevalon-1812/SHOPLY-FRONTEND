import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';
import {
  Store,
  Package,
  Boxes,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  IndianRupee,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  Check,
  X,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const AdminSellerProducts = () => {
  const [sellersData, setSellersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSellerId, setSelectedSellerId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [expandedSellerIds, setExpandedSellerIds] = useState([]);
  
  // Rejection modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    product: null,
    reason: 'Product does not meet catalog quality standards',
    customReason: '',
  });

  const { addToast } = useToast();

  const toggleSellerExpand = (sellerId) => {
    setExpandedSellerIds((prev) =>
      prev.includes(sellerId) ? prev.filter((id) => id !== sellerId) : [...prev, sellerId]
    );
  };

  const expandAll = () => {
    setExpandedSellerIds(sellersData.map((s) => s.seller._id));
  };

  const collapseAll = () => {
    setExpandedSellerIds([]);
  };

  const handleSelectSeller = (sellerId) => {
    setSelectedSellerId(sellerId);
    if (sellerId !== 'all') {
      setExpandedSellerIds((prev) => (prev.includes(sellerId) ? prev : [...prev, sellerId]));
    }
  };

  const isSellerExpanded = (sellerId) => {
    if (searchQuery.trim().length > 0) return true;
    if (approvalFilter === 'pending') return true;
    if (selectedSellerId !== 'all' && selectedSellerId === sellerId) return true;
    return expandedSellerIds.includes(sellerId);
  };

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/seller-products');
      setSellersData(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load seller products catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  // Approve product
  const handleApproveProduct = async (productId, productTitle) => {
    try {
      const { data } = await api.put(`/admin/products/${productId}/approval`, {
        status: 'approved',
      });
      addToast(data.message || `"${productTitle}" approved and published to storefront!`, 'success');
      
      // Update state locally
      setSellersData((prev) =>
        prev.map((group) => {
          const updated = group.products.map((p) =>
            p._id === productId ? { ...p, approvalStatus: 'approved', rejectionReason: '' } : p
          );
          return {
            ...group,
            products: updated,
            pendingCount: updated.filter((p) => p.approvalStatus === 'pending').length,
            approvedCount: updated.filter((p) => p.approvalStatus === 'approved').length,
            rejectedCount: updated.filter((p) => p.approvalStatus === 'rejected').length,
          };
        })
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve product', 'error');
    }
  };

  // Open rejection modal
  const openRejectModal = (product) => {
    setRejectModal({
      isOpen: true,
      product,
      reason: 'Product does not meet catalog quality standards',
      customReason: '',
    });
  };

  // Confirm rejection
  const handleConfirmReject = async () => {
    if (!rejectModal.product) return;
    const finalReason = rejectModal.customReason.trim() || rejectModal.reason;

    try {
      const { data } = await api.put(`/admin/products/${rejectModal.product._id}/approval`, {
        status: 'rejected',
        reason: finalReason,
      });
      addToast(data.message || `Product rejected`, 'info');

      // Update state locally
      setSellersData((prev) =>
        prev.map((group) => {
          const updated = group.products.map((p) =>
            p._id === rejectModal.product._id
              ? { ...p, approvalStatus: 'rejected', rejectionReason: finalReason }
              : p
          );
          return {
            ...group,
            products: updated,
            pendingCount: updated.filter((p) => p.approvalStatus === 'pending').length,
            approvedCount: updated.filter((p) => p.approvalStatus === 'approved').length,
            rejectedCount: updated.filter((p) => p.approvalStatus === 'rejected').length,
          };
        })
      );
      setRejectModal({ isOpen: false, product: null, reason: '', customReason: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject product', 'error');
    }
  };

  // Approve all pending products for a single seller
  const handleApproveAllForSeller = async (sellerId, sellerShopName) => {
    if (!window.confirm(`Are you sure you want to approve ALL pending products for ${sellerShopName}?`)) {
      return;
    }
    try {
      const { data } = await api.put(`/admin/seller-products/approve-all/${sellerId}`);
      addToast(data.message || `All pending products approved for ${sellerShopName}`, 'success');
      fetchSellerProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to bulk approve products', 'error');
    }
  };

  const handleDeleteProduct = async (productId, productTitle, sellerShopName) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove "${productTitle}" from ${sellerShopName}'s catalog?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/products/${productId}`);
      addToast(`Product "${productTitle}" deleted successfully`, 'success');
      // Update local state
      setSellersData((prev) =>
        prev.map((item) => {
          const updated = item.products.filter((p) => p._id !== productId);
          return {
            ...item,
            productsCount: updated.length,
            pendingCount: updated.filter((p) => p.approvalStatus === 'pending').length,
            approvedCount: updated.filter((p) => p.approvalStatus === 'approved').length,
            rejectedCount: updated.filter((p) => p.approvalStatus === 'rejected').length,
            products: updated,
          };
        })
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  // Platform Aggregates
  const totalSellers = sellersData.length;
  const activeSellers = sellersData.filter((s) => s.seller?.sellerStatus === 'active').length;
  const totalProducts = sellersData.reduce((acc, s) => acc + (s.productsCount || 0), 0);
  const totalPendingProducts = sellersData.reduce(
    (acc, s) => acc + (s.products?.filter((p) => p.approvalStatus === 'pending').length || 0),
    0
  );
  const totalApprovedProducts = sellersData.reduce(
    (acc, s) => acc + (s.products?.filter((p) => p.approvalStatus === 'approved').length || 0),
    0
  );
  const totalRejectedProducts = sellersData.reduce(
    (acc, s) => acc + (s.products?.filter((p) => p.approvalStatus === 'rejected').length || 0),
    0
  );
  const totalCatalogValue = sellersData.reduce(
    (acc, s) => acc + (s.totalInventoryValue || 0),
    0
  );

  // Filter sellers and products
  const filteredSellers = sellersData
    .filter((item) => {
      if (selectedSellerId !== 'all' && item.seller._id !== selectedSellerId) {
        return false;
      }
      if (sellerStatusFilter !== 'all' && item.seller.sellerStatus !== sellerStatusFilter) {
        return false;
      }
      return true;
    })
    .map((item) => {
      let matchedProducts = item.products;

      // Filter by approval status
      if (approvalFilter !== 'all') {
        matchedProducts = matchedProducts.filter((p) => p.approvalStatus === approvalFilter);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchedProducts = matchedProducts.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            item.seller.shopName?.toLowerCase().includes(q) ||
            item.seller.name?.toLowerCase().includes(q)
        );
      }

      return {
        ...item,
        filteredProducts: matchedProducts,
      };
    })
    .filter((item) => {
      // If filtering by approval status and this seller has 0 matching products, omit
      if (approvalFilter !== 'all' && item.filteredProducts.length === 0) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const sellerMatches =
        item.seller.shopName?.toLowerCase().includes(q) ||
        item.seller.name?.toLowerCase().includes(q) ||
        item.seller.email?.toLowerCase().includes(q);
      return sellerMatches || (item.filteredProducts && item.filteredProducts.length > 0);
    });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Merchant Catalog Governance
            </span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Approval Queue
            </span>
            {totalPendingProducts > 0 && (
              <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                {totalPendingProducts} Pending Approval
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Seller Products & Approval Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
            When sellers add new products, they are held in <strong>Pending</strong> state until approved by an administrator. Review details, approve to publish live on the storefront, or reject with feedback.
          </p>
        </div>

        <button
          onClick={fetchSellerProducts}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors hover:border-slate-300 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Sellers</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalSellers}</p>
        </div>

        {/* Pending Products Highlight Card */}
        <div
          onClick={() => setApprovalFilter('pending')}
          className={`bg-white dark:bg-[#0c1427] border p-5 rounded-2xl shadow-xs transition-all cursor-pointer ${
            approvalFilter === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-400/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Awaiting Admin Approval</p>
            {totalPendingProducts > 0 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalPendingProducts}
          </p>
        </div>

        {/* Live Approved Products Card */}
        <div
          onClick={() => setApprovalFilter('approved')}
          className={`bg-white dark:bg-[#0c1427] border p-5 rounded-2xl shadow-xs transition-all cursor-pointer ${
            approvalFilter === 'approved'
              ? 'border-emerald-500 ring-2 ring-emerald-400/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Live on Storefront</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalApprovedProducts}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Catalog Valuation</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(totalCatalogValue)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl space-y-4 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title, brand, or merchant..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Product Approval Status Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] font-bold shrink-0">Product Status:</span>
            {[
              { id: 'all', label: 'All Listings', count: totalProducts },
              { id: 'pending', label: 'Pending Approval', count: totalPendingProducts, isAmber: true },
              { id: 'approved', label: 'Approved & Live', count: totalApprovedProducts, isGreen: true },
              { id: 'rejected', label: 'Rejected', count: totalRejectedProducts, isRed: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setApprovalFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  approvalFilter === tab.id
                    ? 'bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                    approvalFilter === tab.id
                      ? 'bg-white/20 text-white dark:text-slate-950'
                      : tab.isAmber && tab.count > 0
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Seller Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Filter by Specific Merchant:</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleSelectSeller('all')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedSellerId === 'all'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Sellers</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {totalProducts}
              </span>
            </button>

            {sellersData.map((s) => {
              const pendingInSeller = s.products?.filter((p) => p.approvalStatus === 'pending').length || 0;
              return (
                <button
                  key={s.seller._id}
                  onClick={() => handleSelectSeller(s.seller._id)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedSellerId === s.seller._id
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm ring-2 ring-amber-400/40'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Store className="w-3 h-3 text-amber-500" />
                  <span>{s.seller.shopName}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.2 rounded-full">
                    {s.productsCount}
                  </span>
                  {pendingInSeller > 0 && (
                    <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      {pendingInSeller} pending
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Seller Catalogs List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">Loading merchant catalogs...</p>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Products Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {approvalFilter !== 'all'
              ? `No products found with status "${approvalFilter}". Try switching status filters.`
              : 'No merchant listings match your current filters or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSellers.map((item) => {
            const { seller } = item;
            const displayProducts = item.filteredProducts !== undefined ? item.filteredProducts : item.products;
            const isExpanded = isSellerExpanded(seller._id);
            const pendingInThisSeller = item.products.filter((p) => p.approvalStatus === 'pending').length;

            return (
              <div
                key={seller._id}
                className={`bg-white dark:bg-[#0c1427] border rounded-3xl overflow-hidden shadow-sm transition-all ${
                  isExpanded
                    ? 'border-slate-300 dark:border-slate-700 ring-1 ring-slate-200 dark:ring-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Seller Profile Header Banner */}
                <div className="p-6 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSellerExpand(seller._id)}
                      className="w-12 h-12 rounded-2xl bg-[#1a2f50] dark:bg-amber-500 text-amber-400 dark:text-slate-950 flex items-center justify-center font-black text-xl shadow-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      title={`Click to ${isExpanded ? 'hide' : 'view'} products for ${seller.shopName}`}
                    >
                      <Store className="w-6 h-6" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => toggleSellerExpand(seller._id)}
                          className="text-left group flex items-center gap-2 cursor-pointer"
                        >
                          <h2 className="text-lg font-black text-slate-950 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                            {seller.shopName}
                          </h2>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-amber-500' : ''
                            }`}
                          />
                        </button>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            seller.sellerStatus === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          {seller.sellerStatus === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Active Merchant
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Pending Seller
                            </>
                          )}
                        </span>

                        {pendingInThisSeller > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                            <Clock className="w-3 h-3" /> {pendingInThisSeller} Needs Approval
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {seller.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{seller.email}</span>
                        </span>
                        {seller.phone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{seller.phone}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges and View Products Button */}
                  <div className="flex items-center gap-2 text-xs flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
                    {/* Bulk Approve All Button */}
                    {pendingInThisSeller > 0 && (
                      <button
                        type="button"
                        onClick={() => handleApproveAllForSeller(seller._id, seller.shopName)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer transition-all"
                        title="Approve all pending products for this merchant in one click"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve All ({pendingInThisSeller})</span>
                      </button>
                    )}

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-center shadow-2xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catalog Items</p>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{item.productsCount} Products</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-center shadow-2xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inventory Value</p>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatINR(item.totalInventoryValue)}
                      </p>
                    </div>

                    {/* Dedicated View/Hide Button */}
                    <button
                      type="button"
                      onClick={() => toggleSellerExpand(seller._id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer ${
                        isExpanded
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Products ({displayProducts.length})</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* When Expanded: Show Products Table or Empty Notice */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                    {displayProducts.length === 0 ? (
                      <div className="p-8 text-center space-y-1.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          No products found in this category for {seller.shopName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {approvalFilter !== 'all'
                            ? `No items match status "${approvalFilter}".`
                            : 'This seller has not submitted any products yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                            <tr>
                              <th className="py-3.5 px-6">Product Item</th>
                              <th className="py-3.5 px-4">Category</th>
                              <th className="py-3.5 px-4">Price</th>
                              <th className="py-3.5 px-4">Stock</th>
                              <th className="py-3.5 px-4">Approval Status</th>
                              <th className="py-3.5 px-6 text-right">Admin Decision Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {displayProducts.map((p) => {
                              const isPending = p.approvalStatus === 'pending';
                              const isApproved = p.approvalStatus === 'approved';
                              const isRejected = p.approvalStatus === 'rejected';

                              return (
                                <tr
                                  key={p._id}
                                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors ${
                                    isPending ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                                  }`}
                                >
                                  {/* Product Item info */}
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={p.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                                        alt={p.title}
                                        referrerPolicy="no-referrer"
                                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                                        onError={(e) => handleImageError(e, p.images?.[0])}
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                                          {p.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                                          <span>Brand: {p.brand}</span>
                                          {p.sku && <span>• SKU: {p.sku}</span>}
                                          {p.isFeatured && (
                                            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                                              Featured
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Category */}
                                  <td className="py-4 px-4">
                                    <span className="inline-block bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-lg text-[11px]">
                                      {p.category}
                                    </span>
                                  </td>

                                  {/* Price */}
                                  <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                                    {formatINR(p.price)}
                                    {p.discountPrice > 0 && (
                                      <span className="block text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                                        Sale: {formatINR(p.discountPrice)}
                                      </span>
                                    )}
                                  </td>

                                  {/* Stock */}
                                  <td className="py-4 px-4">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        p.stock > 10
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                          : p.stock > 0
                                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                                      }`}
                                    >
                                      {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                                    </span>
                                  </td>

                                  {/* Approval Status Badge */}
                                  <td className="py-4 px-4">
                                    {isPending && (
                                      <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                                          <span>Pending Approval</span>
                                        </span>
                                        <p className="text-[10px] text-slate-400">Not visible on website</p>
                                      </div>
                                    )}
                                    {isApproved && (
                                      <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                          <span>Approved & Live</span>
                                        </span>
                                        <p className="text-[10px] text-emerald-600/80">Active on Storefront</p>
                                      </div>
                                    )}
                                    {isRejected && (
                                      <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                          <XCircle className="w-3 h-3 text-rose-500" />
                                          <span>Rejected</span>
                                        </span>
                                        {p.rejectionReason && (
                                          <p className="text-[10px] text-rose-500 line-clamp-1" title={p.rejectionReason}>
                                            {p.rejectionReason}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Moderation Actions Column */}
                                  <td className="py-4 px-6 text-right">
                                    <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                      {/* Approve Action */}
                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveProduct(p._id, p.title)}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-105"
                                          title="Approve this product and publish to live storefront"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Approve</span>
                                        </button>
                                      )}

                                      {/* Reject Action */}
                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => openRejectModal(p)}
                                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                          title="Reject this product listing"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                          <span>Reject</span>
                                        </button>
                                      )}

                                      {/* If Approved: Allow Revoking / Rejecting or Storefront View */}
                                      {isApproved && (
                                        <>
                                          <Link
                                            to={`/product/${p._id}`}
                                            target="_blank"
                                            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
                                            title="View Live Listing on Storefront"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => openRejectModal(p)}
                                            className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                            title="Revoke / Reject Listing"
                                          >
                                            Revoke
                                          </button>
                                        </>
                                      )}

                                      {/* If Rejected: Allow Re-Approve */}
                                      {isRejected && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveProduct(p._id, p.title)}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                          title="Re-approve this product"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Re-Approve</span>
                                        </button>
                                      )}

                                      {/* Delete action */}
                                      <button
                                        onClick={() => handleDeleteProduct(p._id, p.title, seller.shopName)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shadow-2xs cursor-pointer"
                                        title="Moderate & Permanently Delete Listing"
                                      >
                                        <Trash2 className="w-4 h-4" />
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Product Feedback Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Reject Product Listing
                </h3>
              </div>
              <button
                onClick={() => setRejectModal({ isOpen: false, product: null, reason: '', customReason: '' })}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are rejecting <strong>"{rejectModal.product?.title}"</strong>.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                This item will not be visible on the public store. The merchant will receive this feedback so they can fix and resubmit.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Common Reason:
              </label>
              {[
                'Product does not meet catalog quality standards',
                'Inaccurate or misleading title, brand, or specifications',
                'Low image resolution or watermarked photography',
                'Unrealistic pricing or stock level mismatch',
                'Suspected counterfeit or unauthorized branded goods',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectModal((prev) => ({ ...prev, reason: preset, customReason: '' }))}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                    rejectModal.reason === preset && !rejectModal.customReason
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Or Custom Feedback:
              </label>
              <textarea
                rows="2"
                value={rejectModal.customReason}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, customReason: e.target.value }))}
                placeholder="Enter specific instructions for the seller..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, product: null, reason: '', customReason: '' })}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerProducts;
