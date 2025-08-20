'use client';

import { useState, useEffect } from 'react';

interface BookAnalytics {
  totalReaders: number;
  averageProgress: number;
  completionRate: number;
  averageReadingTime: number;
  totalReadingHours: number;
  readersByProgress: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  readingActivity: Array<{
    date: string;
    activeReaders: number;
    newReaders: number;
    completions: number;
  }>;
  topReaders: Array<{
    userId: number;
    userName: string;
    progress: number;
    readingTime: number;
    lastActive: string;
  }>;
}

interface BookAnalyticsDashboardProps {
  bookId: number;
}

export default function BookAnalyticsDashboard({ bookId }: BookAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<BookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookAnalytics();
  }, [bookId]);

  const fetchBookAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/books/${bookId}/analytics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch book analytics');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching book analytics:', error);
      setError('Error fetching book analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <i className="ri-error-warning-line text-4xl mb-4"></i>
        <p>{error}</p>
        <button 
          onClick={fetchBookAnalytics}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-600 py-8">
        <i className="ri-bar-chart-line text-4xl mb-4"></i>
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Readers</p>
              <p className="text-2xl font-bold">{analytics.totalReaders}</p>
            </div>
            <i className="ri-user-line text-3xl opacity-50"></i>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Avg Progress</p>
              <p className="text-2xl font-bold">{Math.round(analytics.averageProgress)}%</p>
            </div>
            <i className="ri-progress-line text-3xl opacity-50"></i>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</p>
            </div>
            <i className="ri-check-line text-3xl opacity-50"></i>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Hours</p>
              <p className="text-2xl font-bold">{Math.round(analytics.totalReadingHours)}</p>
            </div>
            <i className="ri-time-line text-3xl opacity-50"></i>
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reader Progress Distribution</h3>
        <div className="space-y-3">
          {analytics.readersByProgress.map((range, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 w-20">{range.range}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-48">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${range.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{range.count}</span>
                <span className="text-xs text-gray-500 ml-1">({range.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Readers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Readers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-700">Reader</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Progress</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Reading Time</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topReaders.map((reader, index) => (
                <tr key={reader.userId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-900">{reader.userName}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${reader.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.round(reader.progress)}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{Math.round(reader.readingTime)}h</td>
                  <td className="py-3 text-sm text-gray-600">{new Date(reader.lastActive).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reading Activity Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reading Activity</h3>
        <div className="space-y-4">
          {analytics.readingActivity.slice(0, 7).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>{activity.activeReaders} active</span>
                <span>{activity.newReaders} new</span>
                <span>{activity.completions} completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}