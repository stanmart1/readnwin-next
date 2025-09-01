'use client';

import { UserProfile } from '../types/profile';

interface StatsCardsProps {
  profile: UserProfile | null;
}

export default function StatsCards({ profile }: StatsCardsProps) {
  const stats = [
    {
      label: 'Books Read',
      value: profile?.readingStats?.totalBooksRead || 0,
      icon: 'ri-book-line',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Hours Read',
      value: profile?.readingStats?.totalHoursRead || 0,
      icon: 'ri-time-line',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Current Streak',
      value: profile?.readingStats?.currentStreak || 0,
      icon: 'ri-fire-line',
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Avg Rating',
      value: profile?.readingStats?.averageRating?.toFixed(1) || '0.0',
      icon: 'ri-star-line',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
              <i className={`${stat.icon} text-white text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}