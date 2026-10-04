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

  // Prevent background scroll on mobile when notifications modal is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

      {/* Dropdown Panel / Mobile Modal */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay - closes on tap outside */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Notification Card Modal / Dropdown */}
          <div className="fixed inset-x-3.5 top-16 sm:inset-x-auto sm:right-0 sm:absolute sm:top-full sm:mt-2 w-auto sm:w-84 max-w-full sm:max-w-[420px] bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-up max-h-[82vh] flex flex-col">
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-zinc-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline transition-all"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-md transition-colors"
                  title="Close"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            {notifications.length > 0 && (
              <div className="px-3.5 py-2 flex gap-1.5 border-b border-zinc-100 dark:border-slate-800/80 shrink-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    activeTab === 'all'
                      ? 'bg-zinc-900 dark:bg-slate-700 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
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
            <div className="flex-1 max-h-[55vh] sm:max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-slate-800/70 overscroll-contain scrollbar-none">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-slate-800 text-zinc-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-2">
                    <Bell className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-slate-400 mt-1">
                    You are all caught up with your Shoply updates!
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3 sm:p-2.5 hover:bg-zinc-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-2.5 relative group ${
                      !item.read
                        ? 'bg-blue-50/40 dark:bg-blue-950/20'
                        : 'bg-transparent'
                    }`}
                  >
                    {/* Icon Badge */}
                    {getNotificationIcon(item.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs sm:text-[11px] truncate ${
                            !item.read
                              ? 'font-bold text-zinc-900 dark:text-white'
                              : 'font-medium text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] sm:text-[9px] text-zinc-400 dark:text-slate-500 shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[10px] text-zinc-600 dark:text-slate-400 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread Indicator & Delete */}
                    <div className="shrink-0 flex items-center gap-1.5 self-center">
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                      <button
                        onClick={(e) => removeNotification(e, item.id)}
                        className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded transition-all"
                        title="Delete"
                        aria-label="Delete notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer View Link */}
            <div className="px-3.5 py-2 border-t border-zinc-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-[10px] shrink-0">
              <span className="text-zinc-500 dark:text-slate-400">
                Shoply Alerts
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/orders');
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Orders</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
