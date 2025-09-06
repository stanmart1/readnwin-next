'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePermissions } from '@/app/hooks/usePermissions';

import { getVisibleTabs } from '@/utils/permission-mapping';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onToggle, isCollapsed, onToggleCollapse }: AdminSidebarProps) {

  const [showProfile, setShowProfile] = useState(false);
  const { data: session } = useSession();
  
  const { permissions, loading: permissionsLoading } = usePermissions(false);

  const adminUser = session?.user;

  // Filter tabs based on actual user permissions from database
  const visibleTabs = (() => {
    if (!session?.user) return [];
    
    // Wait for permissions to load for all users
    if (permissionsLoading) return [];
    
    // Debug logging
    console.log('🔍 AdminSidebar - User permissions:', permissions);
    
    // Use getVisibleTabs function for permission-based filtering
    const tabs = getVisibleTabs(permissions);
    console.log('🔍 AdminSidebar - Visible tabs:', tabs.map(t => t.id));
    
    return tabs;
  })();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowProfile(false);
  };

  // Close sidebar and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      const profileDropdown = document.getElementById('profile-dropdown');
      
      // Close sidebar on mobile
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggleButton && !toggleButton.contains(event.target as Node)) {
        onToggle();
      }
      
      // Close profile dropdown
      if (showProfile && profileDropdown && !profileDropdown.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle, showProfile]);

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
        className={`admin-sidebar flex flex-col ${
          isOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'
        } ${isCollapsed ? 'collapsed' : ''}`}
      >

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-blue-600 text-lg"></i>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {adminUser?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    Administrator
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

        {/* Bottom Section - Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 mt-auto">
          <div className="flex items-center justify-between">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 ${
                isCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title="Sign Out"
            >
              <i className="ri-logout-box-r-line text-lg"></i>
              {!isCollapsed && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 