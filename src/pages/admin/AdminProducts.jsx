import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Trash2,
  ExternalLink,
  Search,
  Package,
  Boxes,
  ShieldCheck,
  RefreshCw,
  IndianRupee,
  Layers,
  ArrowRight,
  Sparkles,
  Plus,
  Edit,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/format';
import { handleImageError } from '../../utils/imageHelper';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products');
      // Strictly ensure only admin products (exclude any third-party seller listings)
      const adminOnlyProducts = data.filter(
        (p) => !p.seller?.role || p.seller?.role === 'admin'
      );
      setProducts(adminOnlyProducts);
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the official catalog?`)) {
      return;
    }
    try {
      await api.delete(`/admin/products/${id}`);
      addToast(`Product "${title}" removed successfully`, 'success');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalStock = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock || 0), 0);
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
  }, [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Catalog Governance
            </span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin Inventory
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Admin Products
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage and moderate official platform products. Third-party marketplace seller listings are separated on the Seller Products page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors hover:border-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Info Banner: Pointer to Seller Products */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              Looking for Third-Party Merchant Listings?
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Approved seller items (NP Creation, Yash Corporation, etc.) are organized under their merchant names in Seller Products.
            </p>
          </div>
        </div>

        <Link
          to="/admin/seller-products"
          className="inline-flex items-center gap-1.5 bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black hover:opacity-90 transition-opacity shadow-xs shrink-0"
        >
          <span>Open Seller Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
            <Package className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Official Products
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {products.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Available Inventory
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStock} Units
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs transition-colors">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5">
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Catalog Valuation
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(totalValue)}
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admin products by title, category, or brand..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">Loading admin catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Admin Products Found
            </p>
            <p className="text-[11px] text-slate-400">
              {searchQuery || selectedCategory !== 'all'
                ? 'No admin products match the current search or category filter.'
                : 'No official products registered under the admin account.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Product Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Merchant Origin</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                          onError={(e) => handleImageError(e, p.images?.[0])}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span>Brand: {p.brand || 'Shoply Selection'}</span>
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
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-lg text-[11px]">
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

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-lg">
                        <ShieldCheck className="w-3 h-3 text-amber-500" />
                        <span>Shoply Official (Admin)</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors shadow-2xs"
                          title="Edit Listing (Listing Studio)"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/product/${p._id}`}
                          target="_blank"
                          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
                          title="View Live Listing on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shadow-2xs cursor-pointer"
                          title="Delete Product"
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
    </div>
  );
};
