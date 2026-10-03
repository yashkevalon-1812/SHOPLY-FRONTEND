import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminSellerProducts = () => {
  const [sellersData, setSellersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSellerId, setSelectedSellerId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedSellerIds, setExpandedSellerIds] = useState([]);
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

  const handleDeleteProduct = async (productId, productTitle, sellerShopName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${productTitle}" from ${sellerShopName}'s catalog?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/products/${productId}`);
      addToast(`Product "${productTitle}" deleted successfully`, 'success');
      // Update local state
      setSellersData((prev) =>
        prev.map((item) => ({
          ...item,
          productsCount: item.products.filter((p) => p._id !== productId).length,
          products: item.products.filter((p) => p._id !== productId),
        }))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  // Aggregated Overall Platform Metrics
  const totalSellers = sellersData.length;
  const activeSellers = sellersData.filter((s) => s.seller?.sellerStatus === 'active').length;
  const totalProducts = sellersData.reduce((acc, s) => acc + (s.productsCount || 0), 0);
  const totalCatalogValue = sellersData.reduce(
    (acc, s) => acc + (s.totalInventoryValue || 0),
    0
  );

  // Filter sellers by dropdown/pills and search query
  const filteredSellers = sellersData
    .filter((item) => {
      // Filter by selected seller pill
      if (selectedSellerId !== 'all' && item.seller._id !== selectedSellerId) {
        return false;
      }
      // Filter by status
      if (statusFilter !== 'all' && item.seller.sellerStatus !== statusFilter) {
        return false;
      }
      return true;
    })
    .map((item) => {
      // If search query is entered, filter this seller's products
      if (!searchQuery.trim()) return item;

      const q = searchQuery.toLowerCase().trim();
      const matchedProducts = item.products.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          item.seller.shopName?.toLowerCase().includes(q) ||
          item.seller.name?.toLowerCase().includes(q)
      );

      return {
        ...item,
        filteredProducts: matchedProducts,
      };
    })
    .filter((item) => {
      // If searching and no products match AND seller name doesn't match, omit
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
              Seller Directory
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Seller Products Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
            Inspect, audit, and moderate all catalog listings grouped by approved merchant. When a seller account is approved and adds products, they appear here under that seller's name.
          </p>
        </div>

        <button
          onClick={fetchSellerProducts}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors hover:border-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Catalogs</span>
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

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Approved Merchants</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeSellers}</p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Seller Listings</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalProducts}</p>
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
              placeholder="Search product title, category, brand, or seller..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] font-bold shrink-0">Status:</span>
            {['all', 'active', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Merchants' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Seller Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Filter by Individual Seller:</span>
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
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <span>All Sellers</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {totalProducts}
              </span>
            </button>

            {sellersData.map((s) => (
              <button
                key={s.seller._id}
                onClick={() => handleSelectSeller(s.seller._id)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedSellerId === s.seller._id
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm ring-2 ring-amber-400/40'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Store className="w-3 h-3 text-amber-500" />
                <span>{s.seller.shopName}</span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.2 rounded-full">
                  {s.productsCount}
                </span>
              </button>
            ))}
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Merchant Matches Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No seller accounts match your current filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSellers.map((item) => {
            const { seller } = item;
            const displayProducts = item.filteredProducts !== undefined ? item.filteredProducts : item.products;
            const isExpanded = isSellerExpanded(seller._id);

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
                              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Pending Approval
                            </>
                          )}
                        </span>
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
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-center shadow-2xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catalog Items</p>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{item.productsCount} Products</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-center shadow-2xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stock Units</p>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{item.totalStock} Units</p>
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
                          : 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-700 hover:scale-[1.02]'
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
                          <span>Products ({item.productsCount})</span>
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
                          No products added by {seller.shopName} yet
                        </p>
                        <p className="text-[11px] text-slate-400">
                          When this seller adds items from their Seller Studio, they will automatically appear here under their merchant name.
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
                          <th className="py-3.5 px-4">Inventory Stock</th>
                          <th className="py-3.5 px-4">Rating</th>
                          <th className="py-3.5 px-6 text-right">Storefront Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {displayProducts.map((p) => (
                          <tr
                            key={p._id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                                  alt={p.title}
                                  className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                                    {p.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                    <span>Brand: {p.brand}</span>
                                    {p.isFeatured && (
                                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-block bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-lg text-[11px]">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                              {formatINR(p.price)}
                              {p.discountPrice > 0 && (
                                <span className="block text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                                  Sale: {formatINR(p.discountPrice)}
                                </span>
                              )}
                            </td>
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
                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1 font-bold">
                                <span>★ {p.rating || 5.0}</span>
                                <span className="text-[10px] font-normal text-slate-400">
                                  ({p.numReviews || 0})
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Link
                                  to={`/product/${p._id}`}
                                  target="_blank"
                                  className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
                                  title="View Live Listing on Storefront"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(p._id, p.title, seller.shopName)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shadow-2xs"
                                  title="Moderate & Delete Listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
    </div>
  );
};
