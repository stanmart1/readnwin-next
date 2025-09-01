'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import StatsCards from './components/StatsCards';
import { useProfile } from './hooks/useProfile';
import { usePullToRefresh } from './hooks/usePullToRefresh';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading, error, updateProfile, refetch } = useProfile();
  const { elementRef, isRefreshing, shouldShowIndicator } = usePullToRefresh({
    onRefresh: refetch,
  });

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="animate-pulse p-4">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load profile</p>
            <button 
              onClick={refetch}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Pull to refresh indicator */}
      {shouldShowIndicator && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-full p-3 shadow-lg">
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <i className="ri-refresh-line text-blue-600 text-xl"></i>
            )}
          </div>
        </div>
      )}
      
      <div ref={elementRef} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader 
          profile={profile} 
          onUpdate={updateProfile}
        />
        
        <StatsCards profile={profile} />
        
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          profile={profile}
          onUpdate={updateProfile}
        />
      </div>
    </div>
  );
}