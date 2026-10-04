import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { handleImageError } from '../../utils/imageHelper';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Flame,
  Sparkles,
  Percent,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Package,
  Boxes,
  ArrowUpDown,
  Filter,
  Check,
} from 'lucide-react';
import { formatINR } from '../../utils/format';

export const SellerProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dedicated Product Discount Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountTargetProduct, setDiscountTargetProduct] = useState(null);
  const [productDiscountPrice, setProductDiscountPrice] = useState('');
  const [productIsFlashDeal, setProductIsFlashDeal] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'Luxury Watches',
    brand: '',
    stock: '10',
    images: '',
    isFeatured: false,
    isFlashDeal: false,
  });

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/seller/products');
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load your products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      discountPrice: '',
      category: 'Luxury Watches',
      brand: '',
      stock: '10',
      images: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      isFeatured: false,
      isFlashDeal: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      category: product.category,
      brand: product.brand || '',
      stock: String(product.stock),
      images: Array.isArray(product.images) ? product.images.join(', ') : product.images,
      isFeatured: Boolean(product.isFeatured),
      isFlashDeal: Boolean(product.isFlashDeal),
    });
    setModalOpen(true);
  };

  const openDiscountModal = (product) => {
    setDiscountTargetProduct(product);
    setProductDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
    setProductIsFlashDeal(Boolean(product.isFlashDeal));
    setDiscountModalOpen(true);
  };

  const applyPercentPreset = (percent) => {
    if (!discountTargetProduct) return;
    const discounted = Math.round(discountTargetProduct.price * (1 - percent / 100));
    setProductDiscountPrice(String(discounted));
  };

  const handleSaveProductDiscount = async (e) => {
    e.preventDefault();
    if (!discountTargetProduct) return;
    setSavingDiscount(true);
    try {
      const discVal = Number(productDiscountPrice);
      if (discVal > discountTargetProduct.price) {
        addToast('Discount price cannot be higher than regular price', 'error');
        setSavingDiscount(false);
        return;
      }

      const { data } = await api.put(`/seller/products/${discountTargetProduct._id}`, {
        discountPrice: discVal || 0,
        isFlashDeal: productIsFlashDeal,
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === discountTargetProduct._id ? { ...p, ...data } : p))
      );
      addToast(
        discVal > 0
          ? `Discount successfully applied to "${discountTargetProduct.title}"!`
          : `Regular price restored for "${discountTargetProduct.title}"`,
        'success'
      );
      setDiscountModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update product discount', 'error');
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleRemoveProductDiscount = async () => {
    if (!discountTargetProduct) return;
    setSavingDiscount(true);
    try {
      const { data } = await api.put(`/seller/products/${discountTargetProduct._id}`, {
        discountPrice: 0,
        isFlashDeal: false,
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === discountTargetProduct._id ? { ...p, ...data } : p))
      );
      addToast(`Discount removed from "${discountTargetProduct.title}"`, 'info');
      setDiscountModalOpen(false);
    } catch (err) {
      addToast('Failed to remove discount', 'error');
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rawImages = formData.images
        .split(',')
        .map((img) => img.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        category: formData.category,
        brand: formData.brand,
        stock: Number(formData.stock),
        images:
          rawImages.length > 0
            ? rawImages
            : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        isFeatured: formData.isFeatured,
        isFlashDeal: formData.isFlashDeal,
      };

      if (editingProduct) {
        await api.put(`/seller/products/${editingProduct._id}`, payload);
        if (editingProduct.approvalStatus === 'rejected') {
          addToast('Listing updated and resubmitted for admin review!', 'success');
        } else {
          addToast('Product updated successfully!', 'success');
        }
      } else {
        await api.post('/seller/products', payload);
        addToast(
          'Product submitted! It is now pending admin approval before appearing on the public store.',
          'success'
        );
      }

      setModalOpen(false);
      fetchSellerProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/seller/products/${id}`);
      addToast('Product removed successfully', 'success');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  // Metrics and category extraction
  const totalCount = products.length;
  const approvedCount = products.filter((p) => p.approvalStatus === 'approved').length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'pending').length;
  const rejectedCount = products.filter((p) => p.approvalStatus === 'rejected').length;

  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Status filter
        if (approvalStatusFilter !== 'all' && p.approvalStatus !== approvalStatusFilter) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (p.title || '').toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const id = (p._id || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          if (!title.includes(q) && !brand.includes(q) && !cat.includes(q) && !id.includes(q) && !sku.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
          const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
          const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;
          return priceB - priceA;
        }
        if (sortBy === 'stock-asc') return (a.stock || 0) - (b.stock || 0);
        if (sortBy === 'stock-desc') return (b.stock || 0) - (a.stock || 0);
        // Default newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, approvalStatusFilter, selectedCategory, searchQuery, sortBy]);

  const hasActiveFilters =
    approvalStatusFilter !== 'all' || selectedCategory !== 'all' || searchQuery.trim() !== '' || sortBy !== 'newest';

  const resetFilters = () => {
    setApprovalStatusFilter('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Boxes className="w-3.5 h-3.5" />
            <span>Vault Inventory Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Product Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Control your luxury inventory, adjust pricing and discounts, and monitor administrator verification status in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            to="/seller/products/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm py-3 px-5 rounded-xl sm:rounded-2xl shadow-sm transition-all hover:scale-102 cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-slate-950" />
            <span>Add New Product (Studio)</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Catalog Card */}
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalCount}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span>Valuation:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatINR(totalInventoryValue)}
            </span>
          </div>
        </div>

        {/* Live on Store Card */}
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live on Store
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {approvedCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Publicly visible to all shoppers
          </p>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Under Administrator evaluation
          </p>
        </div>

        {/* Needs Revision Card */}
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Needs Revision
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {rejectedCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Feedback provided by Admin
          </p>
        </div>
      </div>

      {/* Needs Revision Alert Banner */}
      {rejectedCount > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                Action Required: {rejectedCount} product listing(s) require your attention
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                The administrator has returned listings with revision notes. Click below to review feedback and resubmit for approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => setApprovalStatusFilter('rejected')}
            className="shrink-0 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            View Returned Listings ({rejectedCount})
          </button>
        </div>
      )}

      {/* Pending Notice Banner (if pending and no rejected) */}
      {pendingCount > 0 && rejectedCount === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              {pendingCount} product listing(s) awaiting administrator authorization
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              Items stay pending until approved by the admin team to maintain marketplace quality standards.
            </p>
          </div>
        </div>
      )}

      {/* Search, Filter, and Controls Bar */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-xs">
        {/* Status Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Status:
          </span>
          {[
            { id: 'all', label: 'All Listings', count: totalCount },
            { id: 'approved', label: 'Live on Store', count: approvedCount, dotColor: 'bg-emerald-500' },
            { id: 'pending', label: 'Pending Review', count: pendingCount, dotColor: 'bg-amber-500' },
            { id: 'rejected', label: 'Needs Revision', count: rejectedCount, dotColor: 'bg-rose-500' },
          ].map((tab) => {
            const isActive = approvalStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setApprovalStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.dotColor && !isActive && (
                  <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />
                )}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Category, and Sort Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand, category, or SKU..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category, Sort, and Reset */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer text-xs pr-2"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  All Categories
                </option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer text-xs pr-2"
              >
                <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Newest Listings
                </option>
                <option value="price-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Price: High to Low
                </option>
                <option value="stock-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Stock: Lowest First
                </option>
                <option value="stock-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Stock: Highest First
                </option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading catalog inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3.5">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No products found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No catalog items match your selected filters. Try clearing or relaxing your search query.'
                : 'You have not added any product listings to your vault yet.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : (
              <Link
                to="/seller/products/new"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Listing</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[880px]">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-4 px-5 w-[36%]">Product Listing</th>
                    <th className="py-4 px-4 w-[16%]">Brand & Category</th>
                    <th className="py-4 px-4 w-[16%]">Price & Deal</th>
                    <th className="py-4 px-4 w-[12%]">Stock Level</th>
                    <th className="py-4 px-4 w-[20%]">Status & Storefront</th>
                    <th className="py-4 px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredProducts.map((p) => {
                    const isPending = p.approvalStatus === 'pending';
                    const isApproved = p.approvalStatus === 'approved';
                    const isRejected = p.approvalStatus === 'rejected';

                    const currentPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                    const hasDiscount = p.discountPrice > 0 && p.discountPrice < p.price;
                    const discountPercent = hasDiscount
                      ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                      : 0;

                    return (
                      <tr
                        key={p._id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group ${
                          isPending ? 'bg-amber-50/15 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        {/* Product Image & Title */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={p.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-2xs"
                              onError={(e) => handleImageError(e, p.images?.[0])}
                            />
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/seller/products/edit/${p._id}`}
                                className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors block"
                                title={p.title}
                              >
                                {p.title}
                              </Link>

                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {p.sku && (
                                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded">
                                    #{p.sku}
                                  </span>
                                )}

                                {p.isFlashDeal && (
                                  <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                    <span>Flash</span>
                                  </span>
                                )}

                                {p.isFeatured && (
                                  <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                                    <span>Featured</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Brand & Category */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                              {p.brand || 'Shoply Brand'}
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                              {p.category}
                            </span>
                          </div>
                        </td>

                        {/* Price & Discount */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-black text-slate-900 dark:text-white text-xs">
                              {formatINR(currentPrice)}
                            </span>
                            {hasDiscount && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-slate-400 line-through">
                                  {formatINR(p.price)}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/60">
                                  {discountPercent}% OFF
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Stock Badge - NO WRAPPING! */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {p.stock > 10 ? (
                            <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{p.stock} units</span>
                            </span>
                          ) : p.stock > 0 ? (
                            <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>{p.stock} left (Low)</span>
                            </span>
                          ) : (
                            <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>Out of stock</span>
                            </span>
                          )}
                        </td>

                        {/* Storefront Catalog Status */}
                        <td className="py-4 px-4">
                          {isPending && (
                            <div className="space-y-0.5">
                              <span className="whitespace-nowrap inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                                <span>Pending Review</span>
                              </span>
                              <p className="text-[10px] text-slate-400">Awaiting admin review</p>
                            </div>
                          )}
                          {isApproved && (
                            <div className="space-y-0.5">
                              <span className="whitespace-nowrap inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Live on Store</span>
                              </span>
                              <p className="text-[10px] text-emerald-600/80">Publicly visible</p>
                            </div>
                          )}
                          {isRejected && (
                            <div className="space-y-1">
                              <span className="whitespace-nowrap inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                <AlertCircle className="w-3 h-3 text-rose-500" />
                                <span>Needs Revision</span>
                              </span>
                              {p.rejectionReason && (
                                <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-xs font-medium line-clamp-1" title={p.rejectionReason}>
                                  {p.rejectionReason}
                                </p>
                              )}
                              <Link
                                to={`/seller/products/edit/${p._id}`}
                                className="text-[10px] font-bold text-amber-600 hover:underline block"
                              >
                                Edit & Resubmit →
                              </Link>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Live storefront preview link if approved */}
                            {isApproved && (
                              <Link
                                to={`/product/${p._id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View live on website"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Discount Manager Button */}
                            <button
                              onClick={() => openDiscountModal(p)}
                              className={`h-8 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                hasDiscount
                                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-400'
                              }`}
                              title="Manage discount & promotional pricing"
                            >
                              <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>{hasDiscount ? `${discountPercent}%` : 'Discount'}</span>
                            </button>

                            {/* Edit in Studio */}
                            <Link
                              to={`/seller/products/edit/${p._id}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit product listing"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(p._id, p.title)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete product"
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

            {/* Mobile / Tablet Responsive Cards View (Visible on < md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.map((p) => {
                const isPending = p.approvalStatus === 'pending';
                const isApproved = p.approvalStatus === 'approved';
                const isRejected = p.approvalStatus === 'rejected';

                const currentPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                const hasDiscount = p.discountPrice > 0 && p.discountPrice < p.price;
                const discountPercent = hasDiscount
                  ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                  : 0;

                return (
                  <div key={p._id} className="p-4 space-y-3.5">
                    {/* Top Row: Thumbnail + Title + Status */}
                    <div className="flex items-start gap-3">
                      <img
                        src={p.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0"
                        onError={(e) => handleImageError(e, p.images?.[0])}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/seller/products/edit/${p._id}`}
                            className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-amber-600"
                          >
                            {p.title}
                          </Link>
                          {/* Status Pill */}
                          <div className="shrink-0">
                            {isApproved && (
                              <span className="whitespace-nowrap inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Live</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="whitespace-nowrap inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                                <span>Pending</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="whitespace-nowrap inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                <AlertCircle className="w-3 h-3 text-rose-500" />
                                <span>Revision</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Brand & Category */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {p.brand || 'Shoply Brand'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {p.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mid Row: Price + Stock Badge */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {formatINR(currentPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatINR(p.price)}
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {discountPercent}% OFF applied
                          </span>
                        )}
                      </div>

                      {/* Stock Pill - NO WRAPPING */}
                      <div>
                        {p.stock > 10 ? (
                          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{p.stock} in stock</span>
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{p.stock} left (Low)</span>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Out of stock</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badges: Flash Deal or Featured */}
                    {(p.isFlashDeal || p.isFeatured || p.sku) && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.sku && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            #{p.sku}
                          </span>
                        )}
                        {p.isFlashDeal && (
                          <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            <span>Flash Deal</span>
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rejection Alert Box */}
                    {isRejected && (
                      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 space-y-1.5">
                        <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                          Rejection Reason:
                        </p>
                        <p className="text-xs text-rose-700 dark:text-rose-400">
                          {p.rejectionReason || 'Please review your listing details and ensure images meet marketplace specifications.'}
                        </p>
                        <Link
                          to={`/seller/products/edit/${p._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-300 underline"
                        >
                          <span>Edit & Resubmit Listing</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}

                    {/* Mobile Action Buttons Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      {isApproved && (
                        <Link
                          to={`/product/${p._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center justify-center transition-colors"
                          title="View live product"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}

                      <button
                        onClick={() => openDiscountModal(p)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          hasDiscount
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5 text-amber-600" />
                        <span>{hasDiscount ? `${discountPercent}% OFF` : 'Discount'}</span>
                      </button>

                      <Link
                        to={`/seller/products/edit/${p._id}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(p._id, p.title)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center cursor-pointer hover:bg-rose-100 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Product Legacy Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingProduct ? 'Modify Vault Listing' : 'Publish New Vault Listing'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Apex Chronograph Titanium"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the materials, craftsmanship, and specs..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Regular Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="24999"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Discount Price (₹) <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="19999"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Luxury Watches">Luxury Watches</option>
                    <option value="Audio">Audio</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Shoply Studio"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Image URLs <span className="text-slate-400">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              {/* Badges Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFlashDeal}
                    onChange={(e) =>
                      setFormData({ ...formData, isFlashDeal: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-slate-950"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Include in Flash Deals</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-slate-950"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Feature on Storefront</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product-Specific Discount Manager Modal */}
      {discountModalOpen && discountTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-[#131d2e]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Product Discount Studio
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Applies strictly to this specific product listing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiscountModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="p-4 bg-slate-50 dark:bg-[#080d19] border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <img
                src={discountTargetProduct.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                alt={discountTargetProduct.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                onError={(e) => handleImageError(e, discountTargetProduct.images?.[0])}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {discountTargetProduct.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Base Catalog Price: <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(discountTargetProduct.price)}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProductDiscount} className="p-5 space-y-4 text-xs">
              {/* Quick % OFF Presets */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Quick Discount Presets
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 15, 20, 30, 50].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => applyPercentPreset(pct)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 dark:bg-slate-800 dark:hover:bg-amber-950/80 dark:hover:text-amber-300 font-bold rounded-xl text-center border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Sale Price Input */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Sale Price (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={discountTargetProduct.price - 1}
                    required
                    value={productDiscountPrice}
                    onChange={(e) => setProductDiscountPrice(e.target.value)}
                    placeholder="Enter discounted selling price"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 pl-7 text-xs font-black text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Savings Calculation */}
              {Number(productDiscountPrice) > 0 && Number(productDiscountPrice) < discountTargetProduct.price && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[11px]">Buyer Savings:</p>
                    <p className="text-xs">
                      Saves {formatINR(discountTargetProduct.price - Number(productDiscountPrice))} ({Math.round(((discountTargetProduct.price - Number(productDiscountPrice)) / discountTargetProduct.price) * 100)}% OFF)
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Active Deal
                  </span>
                </div>
              )}

              {/* Flash Deal Urgency Toggle */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productIsFlashDeal}
                    onChange={(e) => setProductIsFlashDeal(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Attach "Flash Deal" Urgency Badge to this Product
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                {discountTargetProduct.discountPrice > 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveProductDiscount}
                    disabled={savingDiscount}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    title="Remove discount and restore regular price"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDiscountModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingDiscount}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {savingDiscount ? 'Saving...' : 'Apply Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
