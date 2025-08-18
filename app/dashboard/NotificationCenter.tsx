
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await fetch('/api/dashboard/notifications?limit=10');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        } else {
          throw new Error('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notificationIds: [id], 
          markAsRead: true 
        }),
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return 'ri-trophy-line';
      case 'book': return 'ri-book-line';
      case 'social': return 'ri-thumb-up-line';
      case 'reminder': return 'ri-alarm-line';
      case 'system': return 'ri-notification-line';
      default: return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'book': return 'text-blue-600 bg-blue-100';
      case 'social': return 'text-green-600 bg-green-100';
      case 'reminder': return 'text-purple-600 bg-purple-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">
          <i className="ri-error-warning-line text-2xl"></i>
        </div>
        <p className="text-sm text-gray-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">
          <i className="ri-user-line text-2xl"></i>
        </div>
        <p className="text-sm text-gray-600">Please log in to view notifications</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="ri-notification-off-line text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600">No notifications yet</p>
          <p className="text-xs text-gray-500 mt-1">We'll notify you when there's something new</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                !notification.is_read 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  {notification.title}
                </h3>
                <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {notifications.length > 0 && (
        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer whitespace-nowrap">
          View All Notifications
        </button>
      )}
    </div>
  );
}
