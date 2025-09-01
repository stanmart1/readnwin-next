'use client';

import { useState } from 'react';
import { UserProfile, ProfileUpdateData } from '../types/profile';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import ReadingAnalytics from './ReadingAnalytics';
import SettingsPanel from './SettingsPanel';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: UserProfile | null;
  onUpdate: (data: ProfileUpdateData) => Promise<{ success: boolean; error?: string }>;
}

export default function ProfileTabs({ activeTab, onTabChange, profile, onUpdate }: ProfileTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line' },
    { id: 'settings', label: 'Settings', icon: 'ri-settings-line' },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  const handleSwipeLeft = () => {
    const nextIndex = (currentTabIndex + 1) % tabs.length;
    onTabChange(tabs[nextIndex].id);
  };
  
  const handleSwipeRight = () => {
    const prevIndex = currentTabIndex === 0 ? tabs.length - 1 : currentTabIndex - 1;
    onTabChange(tabs[prevIndex].id);
  };
  
  const swipeRef = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile-optimized tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-0 py-4 px-4 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`${tab.icon} text-lg`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div ref={swipeRef} className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab profile={profile} />
        )}
        
        {activeTab === 'analytics' && (
          <ReadingAnalytics profile={profile} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsPanel profile={profile} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-book-open-line text-blue-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Started reading a new book</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-trophy-line text-green-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Completed reading goal</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      {profile?.isStudent && profile.studentInfo && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p><span className="font-medium">School:</span> {profile.studentInfo.schoolName}</p>
            <p><span className="font-medium">Department:</span> {profile.studentInfo.department}</p>
            <p><span className="font-medium">Course:</span> {profile.studentInfo.course}</p>
          </div>
        </div>
      )}
    </div>
  );
}