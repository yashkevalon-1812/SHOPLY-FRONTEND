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
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ShoplyLogoMark } from './ShoplyLogo';
import api from '../../api/axios';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const accountRef = useRef(null);

  // Focus input on search toggle
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
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

  // Close dropdowns and search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close drawer and dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setAccountDropdownOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-close dropdowns on route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileMenuOpen(false);
      setAccountDropdownOpen(false);
      setIsSearchOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (cleanQuery) {
      navigate(`/shop?keyword=${encodeURIComponent(cleanQuery)}`);
    } else {
      navigate('/shop');
    }
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleDepartmentSelect = (catName) => {
    if (!catName || catName === 'All') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${encodeURIComponent(catName)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* =========================================================================
          TIER 1: PRIMARY MARKETPLACE HEADER (Amazon / Flipkart Inspired)
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0b1329] border-b border-slate-200/90 dark:border-slate-800/90 transition-colors duration-200">
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
              className="md:hidden w-8.5 h-8.5 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 transition-colors cursor-pointer"
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
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2">
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
              className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 shrink-0 flex items-center justify-center"
              ref={searchContainerRef}
            >
              {/* Trigger Button - stays in its fixed slot */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setAccountDropdownOpen(false);
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

              {/* Absolute Popout Search Input to the left (Takes 0 flex layout space, preventing any movement of other navbar options) */}
              {isSearchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center h-8.5 sm:h-9.5 w-48 sm:w-52 md:w-56 lg:w-60 rounded-xl border border-amber-500 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-30 transition-all duration-200 animate-in fade-in slide-in-from-right-2"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500 ml-2.5 shrink-0 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Shoply..."
                    className="w-full h-full px-2 text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none min-w-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
                      aria-label="Clear input"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="h-full px-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer border-l border-slate-200 dark:border-slate-800"
                    title="Close search"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Wishlist Heart Button */}
            <Link
              to="/wishlist"
              className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
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

            {/* 2-LINE AMAZON-STYLE ACCOUNT & LISTS TRIGGER */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  setMobileMenuOpen(false);
                }}
                className="h-8.5 sm:h-9.5 md:h-10 px-2 sm:px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-1.5 text-left transition-colors shadow-2xs shrink-0 cursor-pointer"
                title="Account & Lists"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                    {user ? `Hi, ${user.name.split(' ')[0]}` : 'Hello, Sign in'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-0.5">
                    <span>Account & Lists</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
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

            {/* 4. SHOPPING CART (Icon + Badge Number Only) */}
            <Link
              to="/cart"
              className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
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
        <div className="fixed inset-0 z-50 md:hidden">
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
  );
};
