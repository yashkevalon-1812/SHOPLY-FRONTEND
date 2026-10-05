import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (!user || !user.name) {
        throw new Error('Authentication succeeded but user profile was not returned.');
      }
      addToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate(redirectUrl === 'checkout' ? '/checkout' : redirectUrl);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Invalid credentials', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0b1120] text-zinc-900 dark:text-slate-100 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1a2f50] flex items-center justify-center font-black text-white text-xl shadow-md">
              S
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-zinc-950 dark:text-white">Shoply</span>
          </Link>
          <h2 className="text-2xl font-black text-zinc-950 dark:text-white pt-2">Sign in to your account</h2>
          <p className="text-xs text-zinc-500 dark:text-slate-400 font-medium">
            Access your order tracking, seller studio, or administrator controls.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-3xl p-7 space-y-4 shadow-xl text-xs">
          <div>
            <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl px-3.5 py-3 pl-10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-zinc-700 dark:text-slate-300 font-bold">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-amber-400 cursor-pointer font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl px-3.5 py-3 pl-10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400 dark:text-slate-950" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-zinc-950 dark:text-amber-400 hover:underline">
            Register as a Collector or Merchant
          </Link>
        </p>

        <p className="text-center text-xs text-zinc-500 dark:text-slate-400">
          <Link to="/seller/login" className="hover:underline">
            Seller? Sign in to your shop
          </Link>
        </p>

        <div className="pt-3 text-center border-t border-zinc-200 dark:border-slate-800">
          <Link
            to="/admin/register"
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>Platform Governance · Create Administrator Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
