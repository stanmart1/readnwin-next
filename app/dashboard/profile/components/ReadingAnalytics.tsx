'use client';

import { UserProfile } from '../types/profile';

interface ReadingAnalyticsProps {
  profile: UserProfile | null;
}

export default function ReadingAnalytics({ profile }: ReadingAnalyticsProps) {
  const stats = profile?.readingStats;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reading streak */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.currentStreak || 0} days</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <i className="ri-fire-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          {/* Total pages */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Pages Read</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalPagesRead || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <i className="ri-file-text-line text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite genres */}
      {stats?.favoriteGenres && stats.favoriteGenres.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Genres</h3>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteGenres.map((genre, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reading goals placeholder */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Goals</h3>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <i className="ri-target-line text-4xl text-gray-400 mb-2"></i>
          <p className="text-gray-600">Set your reading goals to track progress</p>
          <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Set Goals
          </button>
        </div>
      </div>
    </div>
  );
}