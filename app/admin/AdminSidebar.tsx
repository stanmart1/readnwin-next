'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePermissions } from '@/app/hooks/usePermissions';
import { getVisibleTabs, canAccessTab } from '@/utils/permission-mapping';

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
  const adminUser = session?.user;

  // Get visible tabs based on user permissions
  const visibleTabs = getVisibleTabs(permissions);

  const notifications = [
    { id: 1, type: 'alert', message: 'New user registration spike detected', time: '5 min ago' },
    { id: 2, type: 'info', message: 'System backup completed successfully', time: '1 hour ago' },
    { id: 3, type: 'warning', message: 'Server load above 80%', time: '2 hours ago' }
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowProfile(false);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggleButton && !toggleButton.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

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
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Notifications"
              >
                <i className="ri-notification-line text-lg"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'alert' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Profile"
              >
                <i className="ri-user-settings-line text-lg"></i>
              </button>
              
              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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