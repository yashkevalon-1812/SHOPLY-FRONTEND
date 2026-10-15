import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LayoutGrid,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Shield,
  Store,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Package,
  Loader2,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ShoplyLogoMark } from './ShoplyLogo';
import { formatINR } from '../../utils/format';
import { handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../../utils/imageHelper';
import api from '../../api/axios';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccountSheetOpen, setMobileAccountSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const accountRef = useRef(null);

  // Focus input on search toggle
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        if (window.innerWidth < 640) {
          mobileSearchInputRef.current?.focus();
        } else {
          searchInputRef.current?.focus();
        }
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Load live categories list with item counts
  useEffect(() => {
    api
      .get('/products/categories')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDepartments(res.data.map((c) => ({ name: c.name, query: c.name, count: c.count })));
        }
      })
      .catch(() => {});
  }, []);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownDismissed(false);
  };

  // Close dropdowns and search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
      const clickedInsideDesktop = searchContainerRef.current && searchContainerRef.current.contains(event.target);
      const clickedInsideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(event.target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        handleCloseSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile drawer or account sheet is open
  useEffect(() => {
    if (mobileMenuOpen || mobileAccountSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, mobileAccountSheetOpen]);

  // Close drawer and dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setAccountDropdownOpen(false);
        handleCloseSearch();
        setMobileAccountSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync search input with URL on route changes:
  // If user entered a keyword and is on /shop?keyword=..., keep search input open showing that word!
  // If navigating to another page without a keyword, close search and remove the word automatically.
  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileMenuOpen(false);
      setAccountDropdownOpen(false);
      setMobileAccountSheetOpen(false);

      const params = new URLSearchParams(location.search);
      const kw = params.get('keyword');
      if (location.pathname === '/shop' && kw) {
        setSearchQuery(kw);
        setIsSearchOpen(true);
        setIsDropdownDismissed(true);
        setSearchResults([]);
      } else if (location.pathname !== '/shop') {
        handleCloseSearch();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Live Instant Search Effect: automatically shows matching products as user types (no Enter key needed)
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery || !isSearchOpen || isDropdownDismissed) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchTotal(0);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?keyword=${encodeURIComponent(cleanQuery)}&limit=6`);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];
        setSearchResults(list);
        setSearchTotal(typeof data?.total === 'number' ? data.total : list.length);
      } catch (err) {
        console.error('Instant search error:', err);
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen, isDropdownDismissed]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    setIsDropdownDismissed(true);
    setSearchResults([]);
    setIsSearching(false);
    if (cleanQuery) {
      setIsSearchOpen(true);
      setSearchQuery(cleanQuery);
      navigate(`/shop?keyword=${encodeURIComponent(cleanQuery)}`);
    } else {
      handleCloseSearch();
      navigate('/shop');
    }
    setMobileMenuOpen(false);
  };

  const handleSelectProduct = (productId) => {
    handleCloseSearch();
    navigate(`/product/${productId}`);
  };

  const handleViewAllResults = () => {
    const cleanQuery = searchQuery.trim();
    setIsDropdownDismissed(true);
    setSearchResults([]);
    setIsSearching(false);
    if (cleanQuery) {
      setIsSearchOpen(true);
      setSearchQuery(cleanQuery);
      navigate(`/shop?keyword=${encodeURIComponent(cleanQuery)}`);
    } else {
      handleCloseSearch();
      navigate('/shop');
    }
  };

  const handleDepartmentSelect = (catName) => {
    handleCloseSearch();
    if (!catName || catName === 'All') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${encodeURIComponent(catName)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-md">
      {/* =========================================================================
          TIER 1: PRIMARY MARKETPLACE HEADER (Amazon / Flipkart Inspired)
         ========================================================================= */}
      <div className="relative bg-white dark:bg-[#0b1329] border-b border-slate-200/90 dark:border-slate-800/90 transition-colors duration-200">
        {/* =========================================================================
            MOBILE DEDICATED SEARCH BAR TAKEOVER (<sm screens)
            When search is activated on phone, it takes over the header with a clean,
            spacious, full-width search input, back button, and clear/cancel controls.
            Prevents squishing the logo or navbar icons.
           ========================================================================= */}
        {isSearchOpen && (
          <div
            ref={mobileSearchRef}
            className="sm:hidden absolute inset-0 z-50 bg-white dark:bg-[#0b1329] px-2.5 flex items-center gap-2 animate-in fade-in duration-150"
          >
            {/* Back / Close Button */}
            <button
              type="button"
              onClick={handleCloseSearch}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer"
              title="Close search"
              aria-label="Close search"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Spacious Mobile Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex items-center h-10 px-3 rounded-xl border border-amber-500 bg-slate-50 dark:bg-slate-900 shadow-inner focus-within:ring-2 focus-within:ring-amber-500/20 transition-all overflow-hidden"
            >
              <Search className="w-4 h-4 text-amber-500 shrink-0 mr-2 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownDismissed(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                placeholder="Search Shoply..."
                className="w-full h-full text-[13.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none min-w-0"
              />
              <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    mobileSearchInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Cancel Action */}
            <button
              type="button"
              onClick={handleCloseSearch}
              className="px-2 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 shrink-0 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="max-w-[1520px] mx-auto px-2.5 sm:px-4 lg:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          
          {/* 1. BRAND AREA: Hamburger + Logo + Deliver To Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setAccountDropdownOpen(false);
              }}
              className="lg:hidden w-8.5 h-8.5 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

            {/* Official Shoply Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <ShoplyLogoMark className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 md:w-10 md:h-10 rounded-xl shadow-xs" />
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg md:text-xl tracking-tight text-slate-950 dark:text-white leading-none">
                  Shoply
                </span>
                <span className="hidden sm:inline-block text-[7px] sm:text-[8px] font-extrabold tracking-[0.18em] text-amber-600 dark:text-amber-400 uppercase leading-none mt-1">
                  EVERYTHING STORE
                </span>
              </div>
            </Link>
          </div>

          {/* 2. PRIMARY NAVIGATION (Desktop & Tablet): Centered */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-[13px] tracking-wide transition-all ${
                location.pathname === '/'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-[13px] tracking-wide transition-all ${
                location.pathname === '/about'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/shop"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-[13px] tracking-wide transition-all ${
                location.pathname === '/shop'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-current" />
              <span>All Products</span>
            </Link>

            <Link
              to="/contact"
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-[13px] tracking-wide transition-all ${
                location.pathname === '/contact'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* 3. RIGHT ACTION HUB: Search (Expands to Left), Theme, Notifications, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Search Trigger / Inline Expandable Input (Opens to the left, fixed slot so nav links never move) */}
            <div
              className="relative w-8 h-8 sm:w-9.5 sm:h-9.5 shrink-0 flex items-center justify-center"
              ref={searchContainerRef}
            >
              {/* Trigger Button - stays in its fixed slot */}
              <button
                type="button"
                onClick={() => {
                  if (isSearchOpen) {
                    handleCloseSearch();
                  } else {
                    setIsSearchOpen(true);
                    setIsDropdownDismissed(false);
                    setAccountDropdownOpen(false);
                  }
                }}
                className={`w-full h-full rounded-xl border flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer ${
                  isSearchOpen
                    ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
                title={isSearchOpen ? 'Close search' : 'Search'}
                aria-label={isSearchOpen ? 'Close search' : 'Search'}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Desktop Popout Search Input to the left (sm: and up only) */}
              {isSearchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 items-center h-8.5 sm:h-9.5 sm:w-64 md:w-72 lg:w-80 rounded-xl border border-amber-500 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-30 transition-all duration-200 animate-in fade-in slide-in-from-right-2"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500 ml-2.5 shrink-0 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownDismissed(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e);
                      }
                    }}
                    placeholder="Search Shoply..."
                    className="w-full h-full px-2 text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none min-w-0"
                  />
                  <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
                      aria-label="Clear input"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseSearch}
                    className="h-full px-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer border-l border-slate-200 dark:border-slate-800"
                    title="Close search"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Live Instant Search Dropdown (Displays automatically without pressing Enter) */}
              {isSearchOpen && !isDropdownDismissed && searchQuery.trim().length > 0 && (
                <div
                  className="fixed top-[62px] left-2.5 right-2.5 sm:absolute sm:top-[calc(100%+8px)] sm:left-auto sm:right-0 w-auto sm:w-92 md:w-[420px] max-h-[75vh] sm:max-h-[480px] flex flex-col bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] sm:z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                  role="listbox"
                  aria-label="Search results"
                >
                  {/* Results Header */}
                  <div className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {isSearching ? 'Searching Catalog...' : `Found ${searchTotal} ${searchTotal === 1 ? 'item' : 'items'}`}
                      </span>
                    </div>
                    {isSearching && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    )}
                  </div>

                  {/* Results List */}
                  <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-slate-800/80">
                    {isSearching && searchResults.length === 0 ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Search className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          No products found for "{searchQuery.trim()}"
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Try searching for a different keyword or browse all items.
                        </p>
                      </div>
                    ) : (
                      searchResults.map((product) => {
                        const effectivePrice =
                          product.discountPrice > 0 ? product.discountPrice : product.price;
                        const hasDiscount =
                          product.discountPrice > 0 && product.discountPrice < product.price;
                        const rawImg = Array.isArray(product.images) && product.images.length > 0
                          ? product.images[0]
                          : product.image || DEFAULT_PRODUCT_PLACEHOLDER;

                        return (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => handleSelectProduct(product._id)}
                            className="w-full text-left p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3 group cursor-pointer"
                          >
                            <img
                              src={rawImg}
                              alt={product.title}
                              onError={(e) => handleImageError(e, rawImg)}
                              className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 object-cover shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                                  {product.category || 'Product'}
                                </span>
                                {product.rating > 0 && (
                                  <span className="inline-flex items-center text-[10px] text-amber-500 font-semibold shrink-0">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" />
                                    {product.rating}
                                  </span>
                                )}
                              </div>
                              <p
                                style={{ WebkitTextStroke: '0.22px currentColor' }}
                                className="font-product-title text-xs sm:text-[13.5px] font-extrabold text-slate-950 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors tracking-tight leading-snug"
                              >
                                {product.title}
                              </p>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {formatINR(effectivePrice)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                                    {formatINR(product.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Results Footer: Full Search Link */}
                  {searchResults.length > 0 && (
                    <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={handleViewAllResults}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>See all {searchTotal} results for "{searchQuery.trim()}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Notifications Dropdown (Available on all devices: Mobile, Tablet & Desktop) */}
            <NotificationDropdown />

            {/* Wishlist Heart Button (Desktop only - shifted to bottom bar on mobile phones) */}
            <Link
              to="/wishlist"
              className="relative hidden lg:flex w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 transition-transform hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* ACCOUNT TRIGGER (Only Icon and User or Admin Name) */}
            <div className="relative hidden lg:block" ref={accountRef}>
              <button
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  setMobileMenuOpen(false);
                }}
                className="h-8.5 sm:h-9.5 md:h-10 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 text-left transition-colors shadow-2xs shrink-0 cursor-pointer"
                title={user ? user.name : 'Sign in'}
                aria-label={user ? user.name : 'User Account'}
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user ? (user.name.split(' ')[0] || user.name) : 'Sign In'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {/* Rich Account & Orders Dropdown Menu */}
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-58 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-up">
                  {user ? (
                    <>
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          {user.role}
                        </span>
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      {user.role === 'seller' && (
                        <Link
                          to="/seller"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Store className="w-4 h-4 text-amber-500" />
                          <span>Seller Studio</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setAccountDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left border-t border-slate-100 dark:border-slate-800 transition-colors cursor-pointer mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3.5 space-y-2.5">
                      <div className="text-center pb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Your Account</p>
                        <p className="text-[10px] text-slate-500">Sign in for personalized deals & fast checkout</p>
                      </div>
                      <Link
                        to="/login"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-colors shadow-xs"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block w-full text-center text-slate-600 dark:text-slate-400 hover:text-amber-600 font-medium text-xs py-1"
                      >
                        New customer? Start here.
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. SHOPPING CART (Desktop only - shifted to bottom bar on mobile phones) */}
            <Link
              to="/cart"
              className="relative hidden lg:flex w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 transition-transform hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs">
                {totalItemsCount || 0}
              </span>
            </Link>
          </div>
        </div>
      </div>


      {/* =========================================================================
          MOBILE OFF-CANVAS LEFT SIDEBAR DRAWER (Full Marketplace Experience)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Left-Side Drawer Sheet */}
          <aside
            className="fixed inset-y-0 left-0 w-[310px] sm:w-[350px] max-w-[85vw] h-full bg-white dark:bg-[#0b1329] border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50 animate-drawer-left overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Drawer Header with Logo & Close Button */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 group"
              >
                <ShoplyLogoMark className="w-8 h-8 rounded-xl shadow-xs" />
                <div className="flex flex-col">
                  <span className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                    Shoply
                  </span>
                  <span className="text-[7px] font-bold tracking-[0.16em] text-amber-600 dark:text-amber-400 uppercase leading-none mt-1">
                    EVERYTHING STORE
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5">
              {/* User Authentication / Profile Card */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                {user ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Sign in to track orders, save favorites & unlock exclusive member deals.
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Navigation Grid */}
              <div>
                <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  Navigation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center text-center transition-all ${
                      location.pathname === '/'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center text-center transition-all ${
                      location.pathname === '/about'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center text-center transition-all ${
                      location.pathname === '/shop'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Products
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center text-center transition-all ${
                      location.pathname === '/contact'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Departments List in Drawer */}
              <div>
                <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  Shop by Department
                </div>
                <div className="space-y-1">
                  {departments.map((dept) => (
                    <button
                      key={dept.name}
                      onClick={() => handleDepartmentSelect(dept.query)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
                    >
                      <span>{dept.name}</span>
                      {dept.count !== undefined && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {dept.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portal Shortcuts for Sellers / Admins */}
              {(user?.role === 'admin' || user?.role === 'seller') && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                    Management
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs mb-1.5"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  {user.role === 'seller' && (
                    <Link
                      to="/seller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs"
                    >
                      <Store className="w-4 h-4" />
                      <span>Seller Studio</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Logout Option */}
              {user && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>

    {/* =========================================================================
        MOBILE BOTTOM NAVIGATION DOCK (Down Side on Phone Screen - ONLY ICONS)
        Wishlist, Account & Lists, Cart
       ========================================================================= */}
    {/* =========================================================================
        MOBILE BOTTOM NAVIGATION DOCK (Proper Balanced Grid Spacing & Icon Size)
        Wishlist, Account & Lists, Cart - 3-Col Even Grid, 52px Squircles, 24px Icons
       ========================================================================= */}
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] pb-[env(safe-area-inset-bottom,0px)]"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}
    >
      <div className="grid grid-cols-3 place-items-center h-16 max-w-sm mx-auto px-6">
        {/* 1. Wishlist (Card: Squircle card with dark outline heart) */}
        <Link
          to="/wishlist"
          onClick={() => setMobileAccountSheetOpen(false)}
          title="Wishlist"
          aria-label="Wishlist"
          className="group block"
        >
          <div
            className="relative flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 active:scale-95"
            style={{ width: '52px', height: '52px', borderRadius: '16px' }}
          >
            <Heart
              className="w-6 h-6 text-slate-800 dark:text-slate-100 transition-transform group-hover:scale-105"
              strokeWidth={2}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full text-[9px] font-black shadow-md bg-rose-600 text-white">
                {wishlistCount}
              </span>
            )}
          </div>
        </Link>

        {/* 2. Account & Lists (Card: Squircle card with peach circular disc & amber user) */}
        <button
          type="button"
          onClick={() => setMobileAccountSheetOpen(!mobileAccountSheetOpen)}
          title="Account & Lists"
          aria-label="Account & Lists"
          className="group block cursor-pointer"
        >
          <div
            className="relative flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 active:scale-95"
            style={{ width: '52px', height: '52px', borderRadius: '16px' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ backgroundColor: '#ffedd5' }}
            >
              <User
                className="w-5 h-5 text-[#d97706]"
                strokeWidth={2.2}
                style={{ color: '#d97706' }}
              />
            </div>
          </div>
        </button>

        {/* 3. Shopping Cart (Card: Squircle card with slate outline cart & orange count badge) */}
        <Link
          to="/cart"
          onClick={() => setMobileAccountSheetOpen(false)}
          title="Shopping Cart"
          aria-label="Shopping Cart"
          className="group block"
        >
          <div
            className="relative flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 active:scale-95"
            style={{ width: '52px', height: '52px', borderRadius: '16px' }}
          >
            <ShoppingCart
              className="w-6 h-6 text-slate-800 dark:text-slate-100 transition-transform group-hover:scale-105"
              strokeWidth={2}
            />
            <span
              className="absolute -top-1.5 -right-1.5 flex h-5.5 min-w-[22px] px-1 items-center justify-center rounded-full text-[11px] font-black shadow-md bg-amber-500 text-slate-950"
              style={{ backgroundColor: '#f59e0b', color: '#020617' }}
            >
              {totalItemsCount || 0}
            </span>
          </div>
        </Link>
      </div>
    </nav>

    {/* =========================================================================
        MOBILE ACCOUNT & LISTS BOTTOM SHEET (Slides Up On Tap)
       ========================================================================= */}
    {mobileAccountSheetOpen && (
      <div className="fixed inset-0 z-50 lg:hidden" style={{ zIndex: 10000 }}>
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileAccountSheetOpen(false)}
          aria-hidden="true"
        />

        {/* Bottom Sheet Modal */}
        <div
          className="fixed bottom-0 inset-x-0 max-h-[85vh] bg-white dark:bg-[#0b1329] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 pb-8 overflow-y-auto z-50 animate-in slide-in-from-bottom duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Account & Lists Menu"
        >
          {/* Handle Bar */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Account & Lists
                </h3>
                <p className="text-[10px] text-slate-400">
                  {user ? `Signed in as ${user.name}` : 'Welcome to Shoply'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileAccountSheetOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {user ? (
            <div className="space-y-4">
              {/* User Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-base shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Account Navigation Links */}
              <div className="space-y-1.5">
                <Link
                  to="/profile"
                  onClick={() => setMobileAccountSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-amber-500" />
                    <span>My Profile</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMobileAccountSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-amber-500" />
                    <span>My Orders & Tracking</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileAccountSheetOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>Admin Portal</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  </Link>
                )}

                {user.role === 'seller' && (
                  <Link
                    to="/seller"
                    onClick={() => setMobileAccountSheetOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-amber-500" />
                      <span>Seller Studio</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  </Link>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileAccountSheetOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-center space-y-1.5">
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Unlock Your Personalized Shopping Experience
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sign in to track orders, manage your wishlist, and enjoy 1-click checkout.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileAccountSheetOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors"
                >
                  <span>Sign In to Your Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileAccountSheetOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  <span>New customer? Start here</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </>
);
};
