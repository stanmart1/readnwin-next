
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { DashboardProvider } from '@/contexts/DashboardContext';
import WelcomeHeader from './WelcomeHeader';
import QuickActions from './QuickActions';
import ReadingProgress from './ReadingProgress';
import ActivityFeed from './ActivityFeed';
import ReadingGoals from './ReadingGoals';
import LibrarySection from './LibrarySection';
import PurchaseHistory from './PurchaseHistory';
import ReviewStats from './ReviewStats';
import NotificationCenter from './NotificationCenter';
import ReadingAnalyticsDashboard from './ReadingAnalyticsDashboard';

export default function Dashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'library', 'activity', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Send welcome email when user first visits dashboard
    const sendWelcomeEmail = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/auth/send-welcome-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            console.log('Welcome email sent successfully');
          } else {
            console.log('Welcome email already sent or failed');
          }
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      }
    };

    sendWelcomeEmail();
  }, [session]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'library', label: 'Library', icon: 'ri-book-line' },
    { id: 'activity', label: 'Activity', icon: 'ri-time-line' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <WelcomeHeader />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <QuickActions />
                <ReadingProgress />
              </div>
              <div className="space-y-8">
                <ReadingGoals />
              </div>
            </div>
          </div>
        );
      
      case 'library':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Library</h2>
              <LibrarySection />
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <ActivityFeed />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
              <NotificationCenter />
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-8">
            <ReadingAnalyticsDashboard />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Show loading state while session is loading
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className={`${tab.icon} text-lg`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
