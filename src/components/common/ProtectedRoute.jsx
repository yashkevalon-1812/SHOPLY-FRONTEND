import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Store, Clock } from 'lucide-react';

export const ProtectedRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] transition-colors">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin route check
  if (role === 'admin' && user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] px-4 py-16 transition-colors">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            This area requires Administrator marketplace privileges. Your current account does not have sufficient clearance.
          </p>
          <a
            href="/"
            className="inline-block bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Return to Storefront
          </a>
        </div>
      </div>
    );
  }

  // Seller route check
  if (role === 'seller') {
    if (user.role !== 'seller' && user.role !== 'admin') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] px-4 py-16 transition-colors">
          <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Seller Account Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              You must be registered as an approved seller to access the Seller Studio.
            </p>
            <a
              href="/register?role=seller"
              className="inline-block bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Apply to Sell on Shoply
            </a>
          </div>
        </div>
      );
    }

    // Pending approval check
    if (user.role === 'seller' && user.sellerStatus === 'pending') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] px-4 py-16 transition-colors">
          <div className="max-w-lg w-full text-center bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              Application Under Review
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Seller Account Pending Approval</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Thank you for applying to sell with Shoply! Your shop <strong className="text-slate-950 dark:text-amber-400 font-bold">{user.shopName || 'Boutique'}</strong> is currently in our vetting queue. An administrator will review and activate your merchant privileges shortly.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="text-slate-900 dark:text-white font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold uppercase">Pending Admin Action</span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-slate-500 dark:text-slate-400">Usually approved within 1 business hour</span>
              </div>
            </div>
            <a
              href="/"
              className="inline-block bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              Browse Shoply Marketplace
            </a>
          </div>
        </div>
      );
    }

    // Rejected check
    if (user.role === 'seller' && user.sellerStatus === 'rejected') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] px-4 py-16 transition-colors">
          <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Application Not Approved</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Your merchant application did not meet our current curation criteria. Please contact concierge support for more details.
            </p>
            <a
              href="/contact"
              className="inline-block bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              Contact Support
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
};
