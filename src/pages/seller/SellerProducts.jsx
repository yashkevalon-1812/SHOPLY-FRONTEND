import { useState, useEffect } from 'react';
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
  Tag,
  Check,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { formatINR } from '../../utils/format';

export const SellerProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
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
      setProducts(data);
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
        images: rawImages.length > 0 ? rawImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
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
        addToast('Product submitted! It is now pending admin approval before appearing on the public store.', 'success');
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

  // Metrics and approval counts
  const totalCount = products.length;
  const approvedCount = products.filter((p) => p.approvalStatus === 'approved').length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'pending').length;
  const rejectedCount = products.filter((p) => p.approvalStatus === 'rejected').length;

  const filteredProducts = products.filter((p) => {
    if (approvalStatusFilter !== 'all' && p.approvalStatus !== approvalStatusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Vault Inventory
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">My Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Create new luxury listings, modify pricing, and track administrator approval status.
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Product (Studio)</span>
        </Link>
      </div>

      {/* Approval Status Explanatory Notices */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              {pendingCount} product listing(s) pending Administrator approval
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              Newly submitted items go directly to Shoply Admin for review before becoming visible to public shoppers on the website.
            </p>
          </div>
        </div>
      )}

      {rejectedCount > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-rose-900 dark:text-rose-200">
              {rejectedCount} product listing(s) require revision
            </p>
            <p className="text-rose-700 dark:text-rose-400 mt-0.5">
              Administrator has returned these listings with feedback. Click "Edit & Resubmit" to make changes and submit for approval again.
            </p>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-bold shrink-0">Filter Status:</span>
        {[
          { id: 'all', label: 'All Listings', count: totalCount },
          { id: 'approved', label: 'Approved & Live', count: approvedCount, isGreen: true },
          { id: 'pending', label: 'Pending Review', count: pendingCount, isAmber: true },
          { id: 'rejected', label: 'Rejected', count: rejectedCount, isRed: true },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setApprovalStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              approvalStatusFilter === tab.id
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                approvalStatusFilter === tab.id
                  ? 'bg-white/20 text-white dark:text-slate-950'
                  : tab.isAmber && tab.count > 0
                  ? 'bg-amber-500 text-white'
                  : tab.isRed && tab.count > 0
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            {approvalStatusFilter !== 'all'
              ? `No products found with status "${approvalStatusFilter}".`
              : "You haven't listed any products yet. Click 'Add New Product' above to publish your first piece!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-4 px-5">Product Details</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price / Discount</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Storefront Status</th>
                  <th className="py-4 px-4">Promotions</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const isPending = p.approvalStatus === 'pending';
                  const isApproved = p.approvalStatus === 'approved';
                  const isRejected = p.approvalStatus === 'rejected';

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors ${
                        isPending ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                            onError={(e) => handleImageError(e, p.images?.[0])}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{p.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{p.category}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">{formatINR(p.price)}</span>
                        {p.discountPrice > 0 && (
                          <div className="mt-0.5">
                            <span className="text-emerald-700 font-bold block text-[11px]">
                              Sale: {formatINR(p.discountPrice)}
                            </span>
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                              {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            p.stock > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      {/* Storefront Catalog Status */}
                      <td className="py-4 px-4">
                        {isPending && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                              <span>Pending Review</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Not live on store yet</p>
                          </div>
                        )}
                        {isApproved && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Live on Store</span>
                            </span>
                            <p className="text-[10px] text-emerald-600/80">Publicly visible</p>
                          </div>
                        )}
                        {isRejected && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              <span>Rejected</span>
                            </span>
                            {p.rejectionReason && (
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-xs font-medium" title={p.rejectionReason}>
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

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.isFlashDeal && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-600" /> Flash
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-rose-600" /> Featured
                            </span>
                          )}
                          {!p.isFlashDeal && !p.isFeatured && (
                            <span className="text-slate-400 text-[11px]">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Live preview link if approved */}
                          {isApproved && (
                            <Link
                              to={`/product/${p._id}`}
                              target="_blank"
                              className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
                              title="View live on website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Dedicated Product Discount Button */}
                          <button
                            onClick={() => openDiscountModal(p)}
                            className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              p.discountPrice > 0
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600'
                            }`}
                            title="Set discount exclusively for this product"
                          >
                            <Percent className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden sm:inline">Discount</span>
                          </button>

                          <Link
                            to={`/seller/products/edit/${p._id}`}
                            className="p-1.5 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                            title="Edit product in Studio"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Modify Vault Listing' : 'Publish New Vault Listing'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Apex Chronograph Titanium"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the materials, craftsmanship, and specs..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Regular Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="24999"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Discount Price (₹) <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="19999"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-slate-500 cursor-pointer"
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
                  <label className="text-slate-700 font-bold block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Shoply Studio"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Image URLs <span className="text-slate-400">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-mono text-[11px]"
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
                  <span className="font-bold text-slate-800">Include in Flash Deals</span>
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
                  <span className="font-bold text-slate-800">Feature on Storefront</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all"
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
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-[#131d2e]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Product Discount Manager
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Applies strictly to this specific product only
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiscountModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="p-4 bg-slate-50 dark:bg-[#0c1421] border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
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
                <p className="text-[11px] text-slate-500">
                  Catalog Base Price: <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(discountTargetProduct.price)}</span>
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
                      className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 dark:bg-slate-800 dark:hover:bg-amber-950 font-bold rounded-xl text-center border border-slate-200 dark:border-slate-700 transition-colors"
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
                    className="w-full bg-slate-50 dark:bg-[#131d2e] border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 pl-7 text-xs font-black text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Savings Calculation */}
              {Number(productDiscountPrice) > 0 && Number(productDiscountPrice) < discountTargetProduct.price && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[11px]">Buyer Savings on this Item:</p>
                    <p className="text-xs">
                      Saves {formatINR(discountTargetProduct.price - Number(productDiscountPrice))} ({Math.round(((discountTargetProduct.price - Number(productDiscountPrice)) / discountTargetProduct.price) * 100)}% OFF)
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Active Deal
                  </span>
                </div>
              )}

              {/* Flash Deal Promotion Toggle */}
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
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors flex items-center gap-1"
                    title="Remove discount and restore regular price"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDiscountModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingDiscount}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl transition-colors shadow-sm disabled:opacity-50"
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
