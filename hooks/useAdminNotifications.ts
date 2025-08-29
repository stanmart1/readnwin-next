'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: number;
  user_id: number;
  type: 'achievement' | 'book' | 'social' | 'reminder' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch recent unread notifications for the bell
      const response = await fetch('/api/admin/notifications?limit=10&isRead=false');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    // Stats feature removed - use local calculation
    const unreadCount = notifications.filter(n => !n.is_read).length;
    setStats({ 
      total: notifications.length, 
      unread: unreadCount, 
      read: notifications.length - unreadCount 
    });
  }, [notifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          isRead: true
        })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        }));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      for (const id of unreadIds) {
        await markAsRead(id);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications, markAsRead]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchStats]);

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}