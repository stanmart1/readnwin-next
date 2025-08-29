'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { ADMIN_TAB_PERMISSIONS } from '@/utils/permission-mapping';
import { rbacService } from '@/utils/rbac-service';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onToggle, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { data: session } = useSession();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { notifications, stats, loading: notificationsLoading, markAsRead, markAllAsRead } = useAdminNotifications();
  const adminUser = session?.user;

  // Filter tabs based on user permissions using RBAC service
  const [visibleTabs, setVisibleTabs] = useState(ADMIN_TAB_PERMISSIONS);
  
  useEffect(() => {
    const filterTabs = async () => {
      if (!session?.user?.id || permissionsLoading) return;
      
      // Super admin and admin users see all tabs
      const isAdminUser = session.user.role === 'admin' || session.user.role === 'super_admin';
      if (isAdminUser) {
        setVisibleTabs(ADMIN_TAB_PERMISSIONS);
        return;
      }
      
      // For other users, check permissions for each tab
      const userId = parseInt(session.user.id);
      const filteredTabs = [];
      
      for (const tab of ADMIN_TAB_PERMISSIONS) {
        if (tab.requiredPermissions.length === 0) {
          // No permissions required, show tab
          filteredTabs.push(tab);
        } else {
          // Check if user has at least one required permission
          let hasPermission = false;
          for (const permission of tab.requiredPermissions) {
            try {
              const canAccess = await rbacService.hasPermission(userId, permission);
              if (canAccess) {
                hasPermission = true;
                break;
              }
            } catch (error) {
              console.error(`Error checking permission ${permission}:`, error);
            }
          }
          if (hasPermission) {
            filteredTabs.push(tab);
          }
        }
      }
      
      setVisibleTabs(filteredTabs);
    };
    
    filterTabs();
  }, [session?.user?.id, session?.user?.role, permissionsLoading, permissions]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowProfile(false);
  };

  // Close sidebar and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      const notificationsDropdown = document.getElementById('notifications-dropdown');
      const notificationsButton = document.getElementById('notifications-button');
      const profileDropdown = document.getElementById('profile-dropdown');
      const profileButton = document.getElementById('profile-button');
      
      // Close sidebar on mobile
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggleButton && !toggleButton.contains(event.target as Node)) {
        onToggle();
      }
      
      // Close notifications dropdown
      if (showNotifications && notificationsDropdown && !notificationsDropdown.contains(event.target as Node) &&
          notificationsButton && !notificationsButton.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      
      // Close profile dropdown
      if (showProfile && profileDropdown && !profileDropdown.contains(event.target as Node) &&
          profileButton && !profileButton.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle, showNotifications, showProfile]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="admin-mobile-overlay"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`admin-sidebar ${
          isOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'
        } ${isCollapsed ? 'collapsed' : ''}`}
      >

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-blue-600 text-lg"></i>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {adminUser?.roleDisplayName || 'Administrator'}
                  </p>
                </div>
              )}
            </div>
            {/* Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <i className={`ri-arrow-left-s-line text-lg transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto">
          {permissionsLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Loading permissions...</p>
            </div>
          ) : (
            <ul className="p-2 space-y-1">
              {visibleTabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={tab.description}
                  >
                    <i className={`${tab.icon} mr-3 text-lg`}></i>
                    {!isCollapsed && <span>{tab.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Notifications */}
            <div className="relative">
              <button
                id="notifications-button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Notifications"
              >
                <i className={`ri-notification-line text-lg ${stats.unread > 0 ? 'text-blue-600' : ''}`}></i>
                {stats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {stats.unread > 99 ? '99+' : stats.unread}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div id="notifications-dropdown" className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Notifications {stats.unread > 0 && (
                          <span className="ml-1 text-xs text-gray-500">({stats.unread} new)</span>
                        )}
                      </h3>
                      {stats.unread > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-xs text-gray-500">Loading...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="ri-notification-off-line text-2xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`flex items-start space-x-3 p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notification.type === 'system' ? 'bg-gray-500' :
                              notification.type === 'achievement' ? 'bg-purple-500' :
                              notification.type === 'book' ? 'bg-blue-500' :
                              notification.type === 'social' ? 'bg-green-500' :
                              notification.type === 'reminder' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${
                                !notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
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
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            onTabChange('notifications');
                            setShowNotifications(false);
                          }}
                          className="w-full text-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                id="profile-button"
                onClick={() => setShowProfile(!showProfile)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Profile"
              >
                <i className="ri-user-settings-line text-lg"></i>
              </button>
              
              {/* Profile Dropdown */}
              {showProfile && (
                <div id="profile-dropdown" className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <i className="ri-logout-box-r-line mr-2"></i>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 