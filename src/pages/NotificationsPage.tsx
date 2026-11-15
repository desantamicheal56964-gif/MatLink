import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifs = async () => {
    const data = await db.getNotifications(user?.id);
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifs();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await db.markNotificationAsRead(id);
    await loadNotifs();
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await db.markAllNotificationsRead(user.id);
      await loadNotifs();
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.is_read : true));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7561A8] mb-1">
            <Bell className="w-4 h-4" />
            Notification Center
          </div>
          <h1 className="font-display font-extrabold text-2xl text-[#252536]">
            Notifications & System Alerts
          </h1>
          <p className="text-xs text-[#8B8D98]">
            Stay informed on purchase requests, approvals, and circular construction milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F2F5] hover:bg-gray-200 text-[#51416F] flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#7561A8]" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#7561A8] text-white shadow-xs'
              : 'bg-white text-[#8B8D98] hover:text-[#252536] border border-gray-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-[#7561A8] text-white shadow-xs'
              : 'bg-white text-[#8B8D98] hover:text-[#252536] border border-gray-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8B8D98]">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !item.is_read ? 'bg-purple-50/40' : 'hover:bg-gray-50/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#252536]">{item.title}</h4>
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#7561A8]" />
                  )}
                </div>
                <p className="text-xs text-[#51416F] leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-[#8B8D98] block pt-1">
                  {new Date(item.created_at).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="p-1.5 rounded-lg text-xs font-semibold text-[#7561A8] hover:bg-white"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
                {item.link && (
                  <button
                    onClick={() => {
                      if (item.link?.startsWith('/seller')) onNavigate('seller');
                      else if (item.link?.startsWith('/buyer')) onNavigate('buyer');
                      else if (item.link?.startsWith('/impact')) onNavigate('impact');
                      else onNavigate('explore');
                    }}
                    className="p-1.5 rounded-lg text-[#7561A8] hover:bg-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
