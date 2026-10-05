import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SellerApplicationForm } from '../components/seller/SellerApplicationForm';
import { Lock, Mail, User, Store, ArrowRight } from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const okClass = 'border-zinc-300 focus:border-amber-500';
const errClass = 'border-red-400 focus:border-red-500 focus:ring-red-500/10';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isSeller = role === 'seller';

  const handleBuyerSubmit = async (e) => {
    e.preventDefault();

    const found = {};
    if (!name.trim()) found.name = 'Enter your full name';
    if (!email.trim()) found.email = 'Enter your email address';
    else if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Enter a valid email address';
    if (!password) found.password = 'Choose a password';
    else if (password.length < 6) found.password = 'Use at least 6 characters';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'buyer',
        phone: phone.trim() || undefined,
      });
      if (!res || !res.token) {
        throw new Error('Registration failed: No authentication token received.');
      }
      addToast(`Welcome to Shoply, ${res.name || 'Shopper'}!`, 'success');
      navigate(res.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-[#0b1120] px-4 py-10 text-zinc-900 dark:text-slate-100 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="space-y-3 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a2f50] text-xl font-black text-white shadow-md">
              S
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Shoply</span>
          </Link>
          <h1 className="pt-1 text-2xl font-black text-zinc-950 dark:text-white">
            {isSeller ? 'Sell on Shoply' : 'Create your account'}
          </h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-slate-400">
            {isSeller
              ? 'Three quick steps. No listing fees, no monthly charges.'
              : 'Join the Shoply marketplace to shop the latest drops.'}
          </p>
        </div>

        {/* Role switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-200/80 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all cursor-pointer ${
              !isSeller ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all cursor-pointer ${
              isSeller ? 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Seller</span>
          </button>
        </div>

        {isSeller ? (
          <SellerApplicationForm compact />
        ) : (
          <form
            onSubmit={handleBuyerSubmit}
            className="space-y-5 rounded-2xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm"
          >
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-800 dark:text-slate-200">Full name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  autoComplete="name"
                  className={`w-full rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 px-3.5 py-2.5 pl-11 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 ${
                    errors.name ? errClass : okClass
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-800 dark:text-slate-200">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 px-3.5 py-2.5 pl-11 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 ${
                    errors.email ? errClass : okClass
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-800 dark:text-slate-200">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className={`w-full rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 px-3.5 py-2.5 pl-11 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 ${
                    errors.password ? errClass : okClass
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-800 dark:text-slate-200">
                Phone <span className="font-normal text-zinc-400 dark:text-slate-500">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
                className="w-full rounded-lg border border-zinc-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 text-xs font-bold text-white dark:text-slate-950 shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating account...' : 'Create account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="text-center text-xs text-zinc-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-zinc-950 dark:text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
