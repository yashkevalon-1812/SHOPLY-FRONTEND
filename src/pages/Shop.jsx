import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ProductCard } from '../components/product/ProductCard';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  X,
  Check,
  Star,
} from 'lucide-react';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  // Filters state initialized from URL query params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [categoriesList, setCategoriesList] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('filter') === 'wishlist') {
      navigate('/wishlist', { replace: true });
      return;
    }
    const urlCategory = searchParams.get('category');
    const urlKeyword = searchParams.get('keyword');
    if (urlCategory) setCategory(urlCategory);
    if (urlKeyword !== null) setKeyword(urlKeyword);
  }, [searchParams, navigate]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        const categories = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : null;

        if (!categories) {
          throw new Error('Expected an array of product categories.');
        }
        setCategoriesList(categories);
      } catch (err) {
        console.error('Error fetching product categories:', err.message);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProductsError('');
      try {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (category && category !== 'All') params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (rating) params.append('rating', rating);
        if (inStock) params.append('inStock', 'true');
        if (sort) params.append('sort', sort);

        const { data } = await api.get(`/products?${params.toString()}`);
        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : null;

        if (!productList) {
          throw new Error('Expected an array of products from the catalog API.');
        }

        setProducts(productList);
        setTotal(Number.isFinite(data?.total) ? data.total : productList.length);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setProducts([]);
        setTotal(0);
        setProductsError('The product catalog is temporarily unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category, minPrice, maxPrice, rating, inStock, sort]);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  const activeFilterCount = [
    Boolean(keyword),
    category && category !== 'All',
    Boolean(minPrice),
    Boolean(maxPrice),
    Boolean(rating),
    Boolean(inStock),
    sort && sort !== 'newest',
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    keyword ||
    (category && category !== 'All') ||
    minPrice ||
    maxPrice ||
    rating ||
    inStock ||
    (sort && sort !== 'newest')
  );

  const getSortLabel = (sortValue) => {
    switch (sortValue) {
      case 'price-asc':
        return 'Price: Low to High';
      case 'price-desc':
        return 'Price: High to Low';
      case 'rating':
        return 'Top rated';
      default:
        return 'Newest Arrivals';
    }
  };

  const handleRemoveCategory = () => {
    setCategory('All');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    setSearchParams(nextParams, { replace: true });
  };

  const handleRemoveSort = () => {
    setSort('newest');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('sort');
    setSearchParams(nextParams, { replace: true });
  };

  const handleRemoveKeyword = () => {
    setKeyword('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('keyword');
    setSearchParams(nextParams, { replace: true });
  };

  const handleRemovePrice = () => {
    setMinPrice('');
    setMaxPrice('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('minPrice');
    nextParams.delete('maxPrice');
    setSearchParams(nextParams, { replace: true });
  };

  const handleRemoveRating = () => {
    setRating('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('rating');
    setSearchParams(nextParams, { replace: true });
  };

  const handleRemoveInStock = () => {
    setInStock(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('inStock');
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setInStock(false);
    setSort('newest');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="bg-white dark:bg-[#0b1120] text-zinc-900 dark:text-white min-h-screen py-10">
      <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 border-b border-zinc-200 dark:border-slate-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Complete Marketplace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-0.5">
              Curated Catalog
            </h1>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">
              Showing {total} certified luxury and precision items
            </p>
          </div>

          {/* Controls: Sort Dropdown & Mobile Filter Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-amber-600 text-[10px] text-white font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-zinc-50 dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Filter Sidebar (Proper Balanced Width: 240px - 256px) */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="bg-zinc-50 dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-2xl p-4 space-y-4.5 sticky top-20 shadow-2xs">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" /> Filter Selection
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Keyword Search */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Search Keywords
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="E.g. Watch, ANC..."
                    className="w-full bg-white dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pl-8.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Categories
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategory('All')}
                    className={`w-full text-left text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center justify-between ${
                      category === 'All'
                        ? 'bg-zinc-950 dark:bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    <span>All Categories</span>
                    {category === 'All' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {categoriesList.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCategory(cat.name)}
                      className={`w-full text-left text-xs font-medium px-3 py-1.5 rounded-xl transition-all flex items-center justify-between ${
                        category.toLowerCase() === cat.name.toLowerCase()
                          ? 'bg-zinc-950 dark:bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${
                          category.toLowerCase() === cat.name.toLowerCase()
                            ? 'bg-zinc-800 text-zinc-200 dark:bg-blue-800'
                            : 'bg-zinc-200 dark:bg-slate-800 text-zinc-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Minimum Rating
                </label>
                <div className="flex gap-1.5">
                  {['', '4', '4.5'].map((rateVal, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRating(rateVal)}
                      className={`flex-1 py-1.5 px-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        rating === rateVal
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-2xs'
                          : 'bg-white dark:bg-[#131d2e] border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      {rateVal === '' ? (
                        'All'
                      ) : (
                        <>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{rateVal}+</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Only Toggle */}
              <div className="pt-2 border-t border-zinc-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-slate-700 text-blue-600 bg-white dark:bg-[#131d2e]"
                  />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-slate-200">
                    Ready to Ship (In Stock Only)
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area - Reclaims Space for 5 Cards/Row */}
          <main className="flex-1 min-w-0 w-full">
            {/* Active Selected Filters Bar (Exact design from user screenshot) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-5 pb-0.5 animate-fadeIn">
                {/* Category Chip */}
                {category && category !== 'All' && (
                  <button
                    type="button"
                    onClick={handleRemoveCategory}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-xs sm:text-[13px] font-semibold hover:bg-sky-100/80 dark:hover:bg-sky-900/60 transition-colors group cursor-pointer shadow-2xs"
                    title={`Remove ${category}`}
                  >
                    <span>{category}</span>
                    <X className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-white" />
                  </button>
                )}

                {/* Sort Chip */}
                {sort && sort !== 'newest' && (
                  <button
                    type="button"
                    onClick={handleRemoveSort}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-xs sm:text-[13px] font-semibold hover:bg-sky-100/80 dark:hover:bg-sky-900/60 transition-colors group cursor-pointer shadow-2xs"
                    title="Reset sorting"
                  >
                    <span>Sort: {getSortLabel(sort)}</span>
                    <X className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-white" />
                  </button>
                )}

                {/* Keyword Chip */}
                {keyword && (
                  <button
                    type="button"
                    onClick={handleRemoveKeyword}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-xs sm:text-[13px] font-semibold hover:bg-sky-100/80 dark:hover:bg-sky-900/60 transition-colors group cursor-pointer shadow-2xs"
                    title="Remove keyword filter"
                  >
                    <span>Search: "{keyword}"</span>
                    <X className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-white" />
                  </button>
                )}

                {/* Price Chip */}
                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={handleRemovePrice}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-xs sm:text-[13px] font-semibold hover:bg-sky-100/80 dark:hover:bg-sky-900/60 transition-colors group cursor-pointer shadow-2xs"
                    title="Remove price filter"
                  >
                    <span>
                      {minPrice && maxPrice
                        ? `Price: ₹${minPrice} - ₹${maxPrice}`
                        : minPrice
                        ? `Price: ≥ ₹${minPrice}`
                        : `Price: ≤ ₹${maxPrice}`}
                    </span>
                    <X className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-white" />
                  </button>
                )}

                {/* Rating Chip */}
                {rating && (
                  <button
                    type="button"
                    onClick={handleRemoveRating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-xs sm:text-[13px] font-semibold hover:bg-sky-100/80 dark:hover:bg-sky-900/60 transition-colors group cursor-pointer shadow-2xs"
                    title="Remove rating filter"
                  >
                    <span>Rating: {rating}★+</span>
                    <X className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-white" />
                  </button>
                )}

                {/* In Stock Chip */}
                {inStock && (
                  <button
                    type="button"
                    onClick={handleRemoveInStock}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-xs sm:text-[13px] font-semibold hover:bg-sky-100/80 dark:hover:bg-sky-900/60 transition-colors group cursor-pointer shadow-2xs"
                    title="Remove in stock filter"
                  >
                    <span>In Stock Only</span>
                    <X className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-white" />
                  </button>
                )}

                {/* Clear all text link/button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#0284c7] dark:text-sky-400 hover:text-[#0369a1] dark:hover:text-sky-200 text-xs sm:text-[13px] font-semibold transition-colors hover:underline cursor-pointer ml-1 py-1 px-1.5"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 xl:gap-8">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-zinc-100 dark:bg-slate-800/60 border border-zinc-200 dark:border-slate-800 rounded-2xl aspect-[3/4] animate-pulse"
                  ></div>
                ))}
              </div>
            ) : productsError ? (
              <div
                role="alert"
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-12"
              >
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Catalog Unavailable
                </h3>
                <p className="text-xs text-zinc-600 dark:text-slate-300">
                  {productsError}
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-zinc-50 dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 mx-auto flex items-center justify-center mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No Matching Vault Items</h3>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mb-6">
                  We couldn't find any items matching your selected criteria. Try loosening your price filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-zinc-900 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 xl:gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-over Drawer (Left Side) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content: slides in from LEFT */}
          <div className="relative mr-auto w-[310px] sm:w-[350px] max-w-[85vw] bg-white dark:bg-[#0f172a] border-r border-zinc-200 dark:border-slate-800 flex flex-col h-full z-10 shadow-2xl animate-drawer-left">
            {/* Header: Sticky Top */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0f172a]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Active Filters Chips Bar inside Mobile Drawer */}
            {hasActiveFilters && (
              <div className="px-4 py-2.5 bg-sky-50/50 dark:bg-sky-950/20 border-b border-zinc-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 shrink-0">
                {category && category !== 'All' && (
                  <button
                    type="button"
                    onClick={handleRemoveCategory}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-sky-950/60 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-[11px] font-semibold"
                  >
                    <span>{category}</span>
                    <X className="w-3 h-3 text-[#0284c7]" />
                  </button>
                )}
                {sort && sort !== 'newest' && (
                  <button
                    type="button"
                    onClick={handleRemoveSort}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-sky-950/60 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-[11px] font-semibold"
                  >
                    <span>Sort: {getSortLabel(sort)}</span>
                    <X className="w-3 h-3 text-[#0284c7]" />
                  </button>
                )}
                {keyword && (
                  <button
                    type="button"
                    onClick={handleRemoveKeyword}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-sky-950/60 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-[11px] font-semibold"
                  >
                    <span>"{keyword}"</span>
                    <X className="w-3 h-3 text-[#0284c7]" />
                  </button>
                )}
                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={handleRemovePrice}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-sky-950/60 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-[11px] font-semibold"
                  >
                    <span>₹{minPrice || 0}-{maxPrice || '∞'}</span>
                    <X className="w-3 h-3 text-[#0284c7]" />
                  </button>
                )}
                {rating && (
                  <button
                    type="button"
                    onClick={handleRemoveRating}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-sky-950/60 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-[11px] font-semibold"
                  >
                    <span>{rating}★+</span>
                    <X className="w-3 h-3 text-[#0284c7]" />
                  </button>
                )}
                {inStock && (
                  <button
                    type="button"
                    onClick={handleRemoveInStock}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] dark:bg-sky-950/60 border border-[#b9e6fe] dark:border-sky-800 text-[#0369a1] dark:text-sky-300 text-[11px] font-semibold"
                  >
                    <span>In Stock</span>
                    <X className="w-3 h-3 text-[#0284c7]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#0284c7] dark:text-sky-400 text-[11px] font-semibold hover:underline ml-1 py-0.5 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Scrollable Filter Body - All Filter Options Responsive */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none overscroll-contain">
              {/* Keyword Search */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Search Keywords
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="E.g. Watch, ANC..."
                    className="w-full bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 rounded-xl px-3 py-2 pl-8.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  {keyword && (
                    <button
                      onClick={() => setKeyword('')}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 py-2 px-3 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500 cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Categories
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategory('All')}
                    className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                      category === 'All'
                        ? 'bg-zinc-950 dark:bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>All Categories</span>
                    {category === 'All' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {categoriesList.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCategory(cat.name)}
                      className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                        category.toLowerCase() === cat.name.toLowerCase()
                          ? 'bg-zinc-950 dark:bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            category.toLowerCase() === cat.name.toLowerCase()
                              ? 'bg-zinc-800 text-zinc-200 dark:bg-blue-800'
                              : 'bg-zinc-200 dark:bg-slate-800 text-zinc-600 dark:text-slate-400'
                          }`}
                        >
                          {cat.count}
                        </span>
                        {category.toLowerCase() === cat.name.toLowerCase() && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 rounded-xl pl-6 pr-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-[#131d2e] border border-zinc-200 dark:border-slate-700 rounded-xl pl-6 pr-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block mb-1.5">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {['', '4', '4.5'].map((rateVal, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRating(rateVal)}
                      className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        rating === rateVal
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-2xs'
                          : 'bg-zinc-50 dark:bg-[#131d2e] border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      {rateVal === '' ? (
                        'All'
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{rateVal}+</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Only Toggle */}
              <div className="pt-2 border-t border-zinc-200 dark:border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-slate-700 text-blue-600 bg-white dark:bg-[#131d2e] focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-slate-200">
                    Ready to Ship (In Stock Only)
                  </span>
                </label>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-[#0c1322] shrink-0 flex gap-2.5">
              <button
                onClick={handleResetFilters}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                Show Results ({total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
