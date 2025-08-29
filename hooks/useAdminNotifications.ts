// Admin notifications feature has been removed
export const useAdminNotifications = () => {
  return {
    notifications: [],
    stats: {
      total: 0,
      unread: 0,
      read: 0,
      byType: {
        system: 0,
        user: 0,
        order: 0,
        book: 0
      }
    },
    loading: false,
    error: null,
    markAsRead: () => {},
    markAllAsRead: () => {},
    refresh: () => {}
  };
};