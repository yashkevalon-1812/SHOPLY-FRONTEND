import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  ShieldCheck,
  Package,
  ShoppingCart,
  Store,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Eye,
  EyeOff,
  Building,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { totalItemsCount } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'address' | 'security' | 'seller'
  const [loading, setLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

  // Form states initialized with current user data
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [country, setCountry] = useState(user?.address?.country || 'India');

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sync state if user changes in context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setPostalCode(user.address?.postalCode || '');
      setCountry(user.address?.country || 'India');
    }
  }, [user]);

  // Fetch user's order count
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const { data } = await api.get('/orders/my');
        if (Array.isArray(data)) {
          setOrdersCount(data.length);
        }
      } catch {
        // Silently handle if orders endpoint fails
      }
    };
    fetchOrderStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    if (password && password.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (password && password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
      };

      if (password) {
        payload.password = password;
      }

      const { data } = await api.put('/auth/profile', payload);

      // Update auth context state with latest user details
      updateUser(data);
      if (data.token) {
        localStorage.setItem('shoply_token', data.token);
        sessionStorage.setItem('shoply_token', data.token);
      }
      localStorage.setItem('shoply_user', JSON.stringify(data));
      sessionStorage.setItem('shoply_user', JSON.stringify(data));

      addToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const roleBadgeColors = {
    admin: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    seller: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    buyer: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  };

  return (
    <div className="bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 min-h-screen py-8 sm:py-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =========================================================================
            1. TOP HERO BANNER & USER HEADER
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#101b33] to-slate-900 dark:from-[#0b1329] dark:via-[#0f1d3d] dark:to-[#0b1329] border border-slate-200/50 dark:border-slate-800 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Avatar & Identity */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                    {user.name}
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      roleBadgeColors[user.role] || roleBadgeColors.buyer
                    }`}
                  >
                    {user.role === 'admin' ? 'Administrator' : user.role === 'seller' ? 'Verified Seller' : 'Verified Buyer'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.email}</span>
                </p>
                {user.createdAt && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all hover:scale-102 backdrop-blur-xs"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>My Orders</span>
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all hover:scale-102 backdrop-blur-xs"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>Cart ({totalItemsCount})</span>
              </Link>
              {user.role === 'seller' && (
                <Link
                  to="/seller"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all hover:scale-102 shadow-md"
                >
                  <Store className="w-4 h-4" />
                  <span>Seller Studio</span>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all hover:scale-102 shadow-md"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
              )}
            </div>
          </div>

          {/* Background Ambient Accents */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        </div>

        {/* =========================================================================
            2. STATS CARDS ROW
           ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acquisitions</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{ordersCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cart Items</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{totalItemsCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Status</p>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                <span>Active</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Tier</p>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">Shoply VIP</h3>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. MAIN PROFILE SETTINGS GRID
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'personal'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal Information</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('address')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'address'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Delivery Address</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'security'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security & Password</span>
              </button>

              {user.role === 'seller' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('seller')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === 'seller'
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Seller Workshop Info</span>
                </button>
              )}
            </div>

            {/* Privacy & Security Card */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Shoply Data Protection</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-slate-400 leading-relaxed">
                Your personal details, address information, and credentials are encrypted using 256-bit AES cryptographic protocols.
              </p>
            </div>
          </div>

          {/* Right Form Editor Panel */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TAB 1: PERSONAL INFORMATION */}
              {activeTab === 'personal' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      Personal Details
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Update your primary contact identity and phone number.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Full Legal Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alexander Vance"
                          required
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Email (Read-Only) */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Registered Email Address
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">Primary Login (Read-Only)</span>
                      </div>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        To change your verified email address, please contact Shoply customer concierge.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DELIVERY ADDRESS */}
              {activeTab === 'address' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      Primary Delivery Address
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Your default destination for high-value orders, express freight, and automated checkout.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Street Address */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Street & Landmark
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="e.g. 42 Grand Horizon Avenue, Suite 501"
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        City / Metropolis
                      </label>
                      <div className="relative flex items-center">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Postal / PIN Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 400001"
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Country
                      </label>
                      <div className="relative flex items-center">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g. India"
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      Password & Credentials
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Change your security passcode. Leave blank if you wish to keep your existing password.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        New Passcode (Min. 6 characters)
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Leave blank to preserve current"
                          className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Confirm New Passcode
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new passcode"
                          className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SELLER WORKSHOP INFO (IF SELLER) */}
              {activeTab === 'seller' && user.role === 'seller' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      Seller Workshop Profile
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Overview of your merchant studio standing on the Shoply marketplace.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Shop Name</p>
                        <h4 className="text-base font-black text-slate-950 dark:text-white">{user.shopName || 'Shoply Independent Studio'}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                        {user.sellerStatus || 'active'}
                      </span>
                    </div>

                    {user.storeDescription && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Bio</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{user.storeDescription}</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link
                        to="/seller"
                        className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        <span>Open Complete Seller Management Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit & Save Changes Footer Bar */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Changes take effect immediately across all sessions.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
