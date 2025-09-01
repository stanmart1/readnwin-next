
'use client';

import { useSession } from 'next-auth/react';
import { useUserStats } from '@/hooks/useUserStats';

export default function WelcomeHeader() {
  const { data: session } = useSession();
  const { stats, loading, error, refetch } = useUserStats();

  const formatHours = (pages: number) => {
    // Estimate 1 hour per 50 pages
    return Math.round(pages / 50);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserInitials = () => {
    const firstName = session?.user?.firstName || '';
    const lastName = session?.user?.lastName || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2 mb-6"></div>
          <div className="flex items-center space-x-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-white/20 rounded w-12 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-16"></div>
              </div>
            ))}
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {session?.user?.firstName || 'Reader'}!
            </h1>
            <p className="text-red-100 mb-4">Unable to load your reading statistics</p>
            <button 
              onClick={refetch}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {session?.user?.firstName || 'Reader'}!
          </h1>
          <p className="text-blue-100 mb-4">Ready to continue your reading journey?</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.booksRead || 0}</div>
              <div className="text-sm text-blue-100">Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.currentlyReading || 0}</div>
              <div className="text-sm text-blue-100">Currently Reading</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.totalHours || 0}</div>
              <div className="text-sm text-blue-100">Hours Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
              <div className="text-sm text-blue-100">Total Books</div>
            </div>
          </div>

          {/* Additional stats for larger screens */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold">{stats?.completedBooks || 0}</div>
              <div className="text-xs text-blue-100">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats?.totalBooks || 0}</div>
              <div className="text-xs text-blue-100">Library</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats?.readingSessions || 0}</div>
              <div className="text-xs text-blue-100">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{Math.round((stats?.averageRating || 0) * 10)}%</div>
              <div className="text-xs text-blue-100">Avg Rating</div>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 ml-6">
          <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/20 flex items-center justify-center overflow-hidden">
            {session?.user?.profileImage ? (
              <img
                src={session.user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {getUserInitials()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
