import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Trash2, UserPlus, X, ShieldCheck } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (userId === currentAdmin._id) {
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

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
            User Management
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">User Directory & Roles</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Inspect registered accounts, reassign role permissions, and onboard platform administrators.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Add New Administrator</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Name & Email</th>
                  <th className="py-4 px-4">Contact Phone</th>
                  <th className="py-4 px-4">Created</th>
                  <th className="py-4 px-4">Seller Status</th>
                  <th className="py-4 px-4">Role Privileges</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {u.name}
                            {u.role === 'admin' && (
                              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {u.role === 'seller' ? (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            u.sellerStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {u.sellerStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role}
                        disabled={u._id === currentAdmin._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-white border border-slate-300 text-xs font-bold text-slate-800 py-1.5 px-3 rounded-xl focus:outline-none focus:border-slate-500 cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {u._id !== currentAdmin._id && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Administrator */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowCreateModal(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Administrator</h3>
                  <p className="text-[11px] text-slate-500">Assign full governance privileges</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="e.g. Vikram Singhania"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin.partner@shoply.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer"
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
