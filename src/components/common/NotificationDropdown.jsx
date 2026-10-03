import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  Truck,
  Sparkles,
  Heart,
  X,
  ExternalLink,
  Radio,
  AlertTriangle,
} from 'lucide-react';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Recently';
  const diff = Math.max(0, (Date.now() - new Date(dateInput).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Load notifications from localStorage or empty array
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('shoply_notifications') || localStorage.getItem('velora_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const fetchLiveNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/notifications');
      if (Array.isArray(data?.notifications) && data.notifications.length > 0) {
        const mapped = data.notifications.map((n) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          time: formatTimeAgo(n.createdAt),
          type: n.type || 'announcement',
          priority: n.priority || 'normal',
          read: Boolean(n.isRead),
          link: n.link || '',
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch user notifications from API:', err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    if (!isAuthenticated) return;
    const pollInterval = setInterval(() => {
      fetchLiveNotifications();
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchLiveNotifications();
    }
  }, [isOpen]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shoply_notifications', JSON.stringify(notifications));
    } catch {
      // Ignore quota errors
    }
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    if (isAuthenticated) {
      api.put('/notifications/mark-all-read').catch(() => {});
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = async (item) => {
    if (!item.read && isAuthenticated) {
      api.put(`/notifications/${item.id}/read`).catch(() => {});
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Truck className="w-3 h-3" />
          </div>
        );
      case 'offer':
        return (
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Tag className="w-3 h-3" />
          </div>
        );
      case 'alert':
        return (
          <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3 h-3" />
          </div>
        );
      case 'announcement':
        return (
          <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Radio className="w-3 h-3" />
          </div>
        );
      case 'wishlist':
        return (
          <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Heart className="w-3 h-3" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 sm:w-80 md:w-84 max-w-[calc(100vw-20px)] bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-up">
          {/* Header */}
          <div className="px-3 pb-2 border-b border-zinc-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-zinc-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5 hover:underline transition-all"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  onClick={clearAllNotifications}
                  className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          {notifications.length > 0 && (
            <div className="px-3 pt-1.5 pb-1 flex gap-1 border-b border-zinc-100 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                  activeTab === 'all'
                    ? 'bg-zinc-900 dark:bg-slate-700 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-zinc-900 dark:bg-slate-700 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-slate-800/70">
            {filteredNotifications.length === 0 ? (
              <div className="py-5 text-center px-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-slate-800 text-zinc-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-1">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
                <p className="text-[9px] text-zinc-500 dark:text-slate-400 mt-0.5">
                  You are all caught up with your Shoply updates!
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-2 sm:p-2.5 hover:bg-zinc-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-2 relative group ${
                    !item.read
                      ? 'bg-blue-50/40 dark:bg-blue-950/20'
                      : 'bg-transparent'
                  }`}
                >
                  {/* Icon Badge */}
                  {getNotificationIcon(item.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-[11px] truncate ${
                          !item.read
                            ? 'font-bold text-zinc-900 dark:text-white'
                            : 'font-medium text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[9px] text-zinc-400 dark:text-slate-500 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-600 dark:text-slate-400 leading-snug line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Unread Indicator or Delete */}
                  <div className="shrink-0 flex items-center gap-1 self-center">
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                    <button
                      onClick={(e) => removeNotification(e, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity"
                      title="Delete"
                      aria-label="Delete notification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer View Link */}
          <div className="px-3 pt-1.5 mt-0.5 border-t border-zinc-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-zinc-500 dark:text-slate-400">
              Shoply Alerts
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/orders');
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View Orders</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
