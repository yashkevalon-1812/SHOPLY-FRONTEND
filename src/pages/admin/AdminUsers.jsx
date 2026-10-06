import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Trash2,
  UserPlus,
  X,
  ShieldCheck,
  Users,
  Store,
  Search,
  RefreshCw,
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filter role: strictly 'user', 'seller', or 'admin'. No 'all' option.
  const [roleFilter, setRoleFilter] = useState('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { user: currentAdmin } = useAuth();
  const { addToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      addToast('User role updated successfully', 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating role', 'error');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (userId === currentAdmin?._id) {
      addToast('Cannot delete your own admin account', 'error');
      return;
    }
    if (!window.confirm(`Delete user account "${name}"?`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      addToast('User removed from database', 'success');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting user', 'error');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setCreating(true);
    try {
      const { data } = await api.post('/admin/users', adminForm);
      addToast(data.message || 'Administrator created successfully', 'success');
      setShowCreateModal(false);
      setAdminForm({ name: '', email: '', password: '', phone: '' });
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create administrator', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Pre-calculated counts for badges
  const userCount = useMemo(
    () => users.filter((u) => u.role === 'buyer' || u.role === 'user').length,
    [users]
  );
  const sellerCount = useMemo(
    () => users.filter((u) => u.role === 'seller').length,
    [users]
  );
  const adminCount = useMemo(
    () => users.filter((u) => u.role === 'admin').length,
    [users]
  );

  // Filter tabs: strictly 'user', 'seller', and 'admin'. No 'all' option.
  const filterTabs = [
    {
      id: 'user',
      label: 'Users',
      count: userCount,
      icon: Users,
    },
    {
      id: 'seller',
      label: 'Sellers',
      count: sellerCount,
      icon: Store,
    },
    {
      id: 'admin',
      label: 'Admins',
      count: adminCount,
      icon: ShieldCheck,
    },
  ];

  // Filtered user collection based on active role tab and search query
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Strict role filtering
      let matchesRole = false;
      if (roleFilter === 'user') {
        matchesRole = u.role === 'buyer' || u.role === 'user';
      } else if (roleFilter === 'seller') {
        matchesRole = u.role === 'seller';
      } else if (roleFilter === 'admin') {
        matchesRole = u.role === 'admin';
      }

      if (!matchesRole) return false;

      // 2. Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (u.name || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const phoneMatch = (u.phone || '').toLowerCase().includes(q);
        const shopMatch = (u.shopName || '').toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || shopMatch;
      }

      return true;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            User Management
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            User Directory & Roles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Inspect registered accounts, reassign role permissions, and onboard platform administrators.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-amber-400 dark:text-slate-950" />
          <span>Add New Administrator</span>
        </button>
      </div>

      {/* Role Filter Tabs (User, Seller, Admin) & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Role Filter Tabs - Strictly User, Seller, Admin (NO 'All' option) */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer font-bold shrink-0 ${
                  isActive
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-[#0c1427] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? 'text-amber-400 dark:text-slate-950'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${roleFilter === 'user' ? 'users' : roleFilter === 'seller' ? 'sellers' : 'admins'}...`}
              className="w-full bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={fetchUsers}
            title="Refresh directory"
            className="p-2.5 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Name & Email</th>
                  <th className="py-4 px-4">Contact Phone</th>
                  <th className="py-4 px-4">Registered Date</th>
                  {roleFilter === 'seller' && <th className="py-4 px-4">Shop Name</th>}
                  <th className="py-4 px-4">Account Status</th>
                  <th className="py-4 px-4">Role Privileges</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={roleFilter === 'seller' ? 7 : 6}
                      className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium"
                    >
                      {searchQuery
                        ? `No matching ${
                            roleFilter === 'user'
                              ? 'users'
                              : roleFilter === 'seller'
                              ? 'sellers'
                              : 'administrators'
                          } found for "${searchQuery}".`
                        : `No ${
                            roleFilter === 'user'
                              ? 'buyer/user accounts'
                              : roleFilter === 'seller'
                              ? 'merchant seller accounts'
                              : 'administrator accounts'
                          } registered yet.`}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                              {u.name}
                              {u.role === 'admin' && (
                                <span className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                              {u._id === currentAdmin?._id && (
                                <span className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {u.phone || '—'}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      {roleFilter === 'seller' && (
                        <td className="py-4 px-4 text-slate-900 dark:text-white font-bold">
                          {u.shopName || '—'}
                        </td>
                      )}
                      <td className="py-4 px-4">
                        {u.role === 'seller' ? (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              u.sellerStatus === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : u.sellerStatus === 'pending'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {u.sellerStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={u.role}
                          disabled={u._id === currentAdmin?._id}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50 shadow-2xs transition-colors"
                        >
                          <option value="buyer">User / Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {u._id !== currentAdmin?._id && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Administrator */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowCreateModal(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-amber-500 text-amber-400 dark:text-slate-950 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add Administrator
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assign full governance privileges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Administrator Name
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="e.g. Vikram Singhania"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin.partner@shoply.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
