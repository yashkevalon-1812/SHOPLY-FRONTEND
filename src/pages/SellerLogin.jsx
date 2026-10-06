import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  Mail,
  Store,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Package,
  ShoppingBag,
  Wallet,
} from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/10';

const PERKS = [
  { icon: Package, text: 'Add unlimited listings with photos and variants' },
  { icon: ShoppingBag, text: 'Track orders, returns and buyer messages in one place' },
  { icon: Wallet, text: 'View payouts and settlement reports any time' },
];

export const SellerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const found = {};
    if (!email.trim()) found.email = 'Enter your email address';
    else if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Enter a valid email address';
    if (!password) found.password = 'Enter your password';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (!user || !user.name) {
        throw new Error('Authentication succeeded but user profile was not returned.');
      }

      if (user.role !== 'seller') {
        // The shared auth endpoint let the credentials through, so clear the
        // session before bouncing them - otherwise we'd be left signed in as
        // the wrong role on a seller-only page.
        logout();

        setFormError(
          user.role === 'admin'
            ? 'This is a seller sign-in page. Use the administrator sign-in instead.'
            : 'Those credentials belong to a buyer account. Sign in from the main login page instead.'
        );
        return;
      }

      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/seller', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid credentials';
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6">
      <div className="mx-auto w-full max-w-[26rem] space-y-5">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2f50] text-lg font-black text-white">
              S
            </span>
            <span className="text-xl font-extrabold tracking-tight text-zinc-950">Shoply</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
            <Store className="h-3 w-3" />
            Seller sign-in
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <h1 className="text-xl font-black text-zinc-950">Sign in to your seller account</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your listings, orders and payouts on Shoply.
          </p>

          {isExpired && !formError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>Your seller session has expired. Please sign in again to access your merchant dashboard.</span>
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {formError}{' '}
                {formError.includes('buyer account') && (
                  <Link to="/login" className="underline">
                    Go to buyer sign-in
                  </Link>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div>
              <label
                htmlFor="seller-email"
                className="mb-1.5 block text-xs font-bold text-zinc-800"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  id="seller-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourshop.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'seller-email-error' : undefined}
                  className={`${inputClass} pl-10 ${errors.email ? 'border-red-400' : 'focus:border-amber-500'}`}
                />
              </div>
              {errors.email && (
                <p id="seller-email-error" className="mt-1.5 text-[11px] font-semibold text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label htmlFor="seller-password" className="text-xs font-bold text-zinc-800">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-amber-700 transition-colors hover:text-amber-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  id="seller-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'seller-password-error' : undefined}
                  className={`${inputClass} pl-10 pr-10 ${errors.password ? 'border-red-400' : 'focus:border-amber-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-3 text-zinc-400 transition-colors hover:text-zinc-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="seller-password-error"
                  className="mt-1.5 text-[11px] font-semibold text-red-600"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="pt-1 text-center text-xs text-zinc-600">
              New seller?{' '}
              <Link
                to="/seller/register"
                className="font-bold text-amber-700 transition-colors hover:text-amber-800 hover:underline"
              >
                Create your seller account
              </Link>
            </p>
          </form>
        </div>

        {/* Perks */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
            Why sell on Shoply
          </p>
          <ul className="mt-3 space-y-2.5">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-xs text-zinc-600">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer links */}
        <div className="flex flex-col items-center gap-3 text-xs text-zinc-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 transition-colors hover:text-zinc-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to customer sign-in
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/about" className="transition-colors hover:text-zinc-900">
              Seller policies
            </Link>
            <Link to="/contact" className="transition-colors hover:text-zinc-900">
              Seller support
            </Link>
            <Link to="/about" className="transition-colors hover:text-zinc-900">
              Fees
            </Link>
          </div>
          <p className="text-[11px] text-zinc-400">
            &copy; {new Date().getFullYear()} Shoply. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
