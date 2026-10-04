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
  Layers,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useCompare } from '../../context/CompareContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ShoplyLogoMark } from './ShoplyLogo';

import api from '../../api/axios';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { compareCount, openCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  const mobileSearchInputRef = useRef(null);

  useEffect(() => {
    if (mobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [mobileSearchOpen]);

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

  // Safe wishlist count
  const [wishlistCount] = useState(() => {
    try {
      const saved = localStorage.getItem('shoply_wishlist') || localStorage.getItem('velora_wishlist') || localStorage.getItem('shopsphere_wishlist');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  });

  const departmentsRef = useRef(null);
  const accountRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentsRef.current && !departmentsRef.current.contains(event.target)) {
        setDepartmentsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
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
        setDepartmentsOpen(false);
        setAccountDropdownOpen(false);
        setMobileSearchOpen(false);
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
      setDepartmentsOpen(false);
      setMobileSearchOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const handleDepartmentSelect = (query) => {
    setDepartmentsOpen(false);
    navigate(`/shop?category=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs">
      {/* =========================================================================
          ROW 1: MAIN HEADER (Height: h-14 sm:h-16, Balanced & Sleek)
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0b1329] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-[1490px] mx-auto px-2.5 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3 lg:gap-4">
          
          {/* 1. Left Brand & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setAccountDropdownOpen(false);
                setDepartmentsOpen(false);
              }}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </button>

            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group">
              {/* Shoply Logo Emblem */}
              <ShoplyLogoMark className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-xs" />
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                  Shoply
                </span>
                <span className="hidden sm:inline-block text-[7px] sm:text-[8px] font-bold tracking-[0.16em] text-amber-600 dark:text-amber-400 uppercase leading-none mt-0.5 sm:mt-1">
                  EVERYTHING STORE
                </span>
              </div>
            </Link>
          </div>

          {/* 2. All Departments Dropdown Button (Desktop) */}
          <div className="relative hidden lg:block shrink-0" ref={departmentsRef}>
            <button
              type="button"
              onClick={() => {
                setDepartmentsOpen(!departmentsOpen);
                setAccountDropdownOpen(false);
              }}
              className={`h-9 sm:h-10 flex items-center gap-1.5 sm:gap-2 px-3 rounded-xl border text-xs sm:text-[13px] font-bold transition-all shadow-2xs cursor-pointer ${
                departmentsOpen
                  ? 'border-amber-500/60 text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Departments</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  departmentsOpen ? 'rotate-180 text-amber-500' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {departmentsOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-up">
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Shop By Department
                </div>
                {departments.map((dept) => (
                  <button
                    key={dept.name}
                    onClick={() => handleDepartmentSelect(dept.query)}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <span>{dept.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Center Search Bar (Tablet / Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="h-9 sm:h-10 hidden md:flex flex-1 max-w-xs md:max-w-sm lg:max-w-lg xl:max-w-xl mx-2 lg:mx-3 relative items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 overflow-hidden shadow-2xs focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all"
          >
            <div className="pl-3 pr-1 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search luxury products, watches, tech..."
              className="w-full h-full px-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="h-full px-3.5 sm:px-4 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              aria-label="Search button"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* 4. Right Actions: Mobile Search Toggle, Theme Toggle, Notifications, Account, Wishlist, Compare, Cart */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Mobile Search Toggle Button (Taps to open/close search bar) */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setAccountDropdownOpen(false);
              }}
              className={`md:hidden w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer ${
                mobileSearchOpen
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/90 dark:bg-amber-950/50'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-600'
              }`}
              title={mobileSearchOpen ? 'Close Search' : 'Open Search'}
              aria-label="Toggle search bar"
            >
              {mobileSearchOpen ? <X className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Theme Toggle Button (Tablet & Desktop, mobile in drawer) */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Account Trigger */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  setMobileMenuOpen(false);
                }}
                className="h-8 sm:h-9 md:h-10 px-1.5 sm:px-2 md:px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-1.5 text-left transition-colors shadow-2xs shrink-0 cursor-pointer"
                title="Account Options"
              >
                <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {user ? `Hi, ${user.name.split(' ')[0]}` : 'Hello'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-0.5">
                    <span>{user ? 'Account' : 'Sign In'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </button>

              {/* Account Dropdown */}
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-54 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-up">
                  {user ? (
                    <>
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
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
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-500" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      {user.role === 'seller' && (
                        <Link
                          to="/seller"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Store className="w-3.5 h-3.5 text-amber-500" />
                          <span>Seller Studio</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setAccountDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left border-t border-slate-100 dark:border-slate-800 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block w-full text-center bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs py-2 rounded-xl transition-colors shadow-2xs"
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

            {/* Wishlist Heart Icon */}
            <Link
              to="/shop?filter=wishlist"
              className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Compare Tool Button (Tablet / Desktop) */}
            <button
              onClick={openCompare}
              className="relative hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Compare Items"
              aria-label="Compare Items"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform hover:scale-110" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon Button */}
            <Link
              to="/cart"
              className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs">
                {totalItemsCount || 0}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar (Opens ONLY when user taps Search option) */}
        {mobileSearchOpen && (
          <div className="md:hidden px-2.5 sm:px-3 pb-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
            <form
              onSubmit={handleSearchSubmit}
              className="h-8.5 relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/95 dark:bg-slate-900/95 overflow-hidden shadow-2xs focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all"
            >
              <div className="pl-2.5 pr-1 text-slate-400 dark:text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search luxury products, watches, tech..."
                className="w-full h-full px-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="h-full px-3.5 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Search button"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =========================================================================
          ROW 2: SUB-NAVIGATION BAR (Minimal height, sleek & compact)
         ========================================================================= */}
      <div className="hidden md:block bg-slate-900 dark:bg-[#060b14] text-slate-200 text-xs border-b border-slate-800/80 transition-colors duration-200">
        <div className="max-w-[1490px] mx-auto px-4 lg:px-6 h-8 sm:h-8.5 flex items-center justify-between gap-4">
          
          {/* Left Navigation Links in requested order: Home, About Us, All Products, Contact Us */}
          <nav className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none">
            <Link
              to="/"
              className={`px-2.5 py-0.5 rounded-md font-semibold text-xs tracking-wide transition-all ${
                location.pathname === '/'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`px-2.5 py-0.5 rounded-md font-semibold text-xs tracking-wide transition-all ${
                location.pathname === '/about'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/shop"
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold text-xs tracking-wide transition-all ${
                location.pathname === '/shop'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="w-3 h-3 text-current" />
              <span>All Products</span>
            </Link>

            <Link
              to="/contact"
              className={`px-2.5 py-0.5 rounded-md font-semibold text-xs tracking-wide transition-all ${
                location.pathname === '/contact'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>

      {/* =========================================================================
          MOBILE OFF-CANVAS LEFT SIDEBAR DRAWER
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
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
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
                        className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold shadow-xs transition-colors"
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

              {/* Main Navigation */}
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

              {/* Department Categories */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  Browse Departments
                </div>
                <div className="space-y-1">
                  {departments.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleDepartmentSelect(d.query);
                      }}
                      className="w-full text-left text-xs font-semibold py-2 px-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <span>{d.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* User Account Controls */}
              {user && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                  <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Account Controls
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  {user.role === 'seller' && (
                    <Link
                      to="/seller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Store className="w-4 h-4 text-amber-500" />
                      <span>Seller Studio</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>My Orders</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Drawer Footer: Theme Preference */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Theme Preference</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
