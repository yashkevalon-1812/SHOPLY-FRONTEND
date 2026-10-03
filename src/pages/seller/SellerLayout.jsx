import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../../components/common/NotificationDropdown';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Tag,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export const SellerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/seller', end: true, label: 'Studio Analytics', icon: LayoutDashboard },
    { to: '/seller/products', label: 'Manage Vault Listings', icon: Package },
    { to: '/seller/coupons', label: 'Discounts & Coupons', icon: Tag },
    { to: '/seller/orders', label: 'Order Fulfillment', icon: ShoppingBag },
  ];

  const currentNav = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Brand & Store Header */}
        <div>
          <div className="flex items-center justify-between">
            <Link to="/seller" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-amber-500 flex items-center justify-center font-black text-amber-400 dark:text-slate-950 text-base shadow-sm group-hover:scale-105 transition-transform">
                <Store className="w-4.5 h-4.5 text-amber-400 dark:text-slate-950" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block truncate leading-tight">
                  {user?.shopName || 'Seller Studio'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  Merchant Portal
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                user?.sellerStatus === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
              }`}
            >
              {user?.sellerStatus === 'active' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Active Merchant
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Awaiting Approval
                </>
              )}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 text-xs font-semibold">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer User Info & Return Link */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {user && (
          <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                {user.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Mobile Top Bar */}
      <header className="md:hidden h-16 bg-white dark:bg-[#0c1427] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/seller" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-amber-500 flex items-center justify-center font-black text-amber-400 dark:text-slate-950 text-xs shadow-xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-950 dark:text-white truncate">
              {user?.shopName || 'Shoply Studio'}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <Link
            to="/seller/orders"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            title="Orders Queue"
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors hover:text-slate-950 dark:hover:text-white"
            title="Return to Storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Return to Storefront</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0c1427] z-50 p-6 flex flex-col justify-between shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-white dark:bg-[#0c1427] border-r border-slate-200 dark:border-slate-800 p-6 shadow-xs overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Main Canvas (offset by desktop sidebar width) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white dark:bg-[#0c1427] border-b border-slate-200 dark:border-slate-800 px-8 lg:px-10 items-center justify-between shrink-0 shadow-2xs sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Seller Studio
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="font-bold text-slate-900 dark:text-white">
              {currentNav?.label || user?.shopName || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <Link
              to="/seller/orders"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Orders Queue</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:scale-102"
              title="Return to Public Storefront"
            >
              <ArrowLeft className="w-4 h-4 text-amber-500" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
