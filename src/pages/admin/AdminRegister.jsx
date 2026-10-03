import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { ShieldCheck, Lock, Mail, User, Phone, KeyRound, ArrowRight, ShieldAlert } from 'lucide-react';

export const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleQuickFillKey = () => {
    setAdminSecretKey('SHOPLY_ADMIN_2026');
    addToast('Admin Security Passcode auto-filled!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !adminSecretKey) {
      addToast('Please fill all mandatory fields and provide the Admin Passcode', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register-admin', {
        name,
        email,
        password,
        phone,
        adminSecretKey,
      });

      addToast(data.message || 'Administrator account established!', 'success');

      // Automatically sign in with newly created admin credentials
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to authorize and create administrator',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Badge & Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 shadow-xl mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">
            Create Administrator Account
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Authorized portal to onboard new platform administrators for the Shoply marketplace.
          </p>
        </div>

        {/* Security Notice Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold block mb-0.5">Admin Passcode Required</span>
            <span>
              Registration requires the master security passcode. For testing or local setups, use{' '}
              <code className="bg-amber-100 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">
                SHOPLY_ADMIN_2026
              </code>
              .
            </span>
            <button
              type="button"
              onClick={handleQuickFillKey}
              className="mt-2 text-[11px] font-bold text-amber-700 hover:text-amber-900 underline block cursor-pointer"
            >
              Click here to auto-fill passcode
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-slate-200/50"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="administrator@shoply.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Mobile Contact (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Admin Security Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={adminSecretKey}
                onChange={(e) => setAdminSecretKey(e.target.value)}
                placeholder="Enter master authorization key..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span>Authorizing Admin Account...</span>
            ) : (
              <>
                <span>Register & Open Admin Console</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500">
          Already have an administrator account?{' '}
          <Link to="/login" className="text-slate-950 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
