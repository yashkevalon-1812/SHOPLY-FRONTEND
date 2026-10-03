import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Mail, Calendar } from 'lucide-react';

export const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact');
      setMessages(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (msgId, newStatus) => {
    try {
      await api.put(`/contact/${msgId}`, { status: newStatus });
      addToast(`Inquiry marked as ${newStatus}`, 'success');
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
          Inquiries Desk
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Client Messages & Inquiries</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Review incoming questions, partnership proposals, and support requests from the storefront.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center text-slate-400 text-xs rounded-3xl font-medium shadow-sm">
            No inquiries received yet.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {m.email}
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={m.status}
                    onChange={(e) => handleStatusChange(m._id, e.target.value)}
                    className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-lg border focus:outline-none cursor-pointer ${
                      m.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : m.status === 'read'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-xs mb-1">
                  Subject: {m.subject}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {m.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
