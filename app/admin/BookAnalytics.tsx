'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface BookAnalytics {
  totalBooks: number;
  totalReads: number;
  totalReadingTime: number;
  averageRating: number;
  popularBooks: Array<{
    id: number;
    title: string;
    author: string;
    reads: number;
    rating: number;
    cover_image_url: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  readingTrends: Array<{
    date: string;
    reads: number;
    newUsers: number;
  }>;
  userEngagement: {
    activeReaders: number;
    completionRate: number;
    averageSessionTime: number;
  };
}

export default function BookAnalytics() {
  const [analytics, setAnalytics] = useState<BookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/books?range=${timeRange}`);
      if (!response.ok) {
        console.error('Analytics API error:', response.status, response.statusText);
        throw new Error(`Failed to load analytics: ${response.status}`);
      }
      const data = await response.json();
      
      // Ensure all required fields exist with defaults
      const safeData = {
        totalBooks: data.totalBooks || 0,
        totalReads: data.totalReads || 0,
        totalReadingTime: data.totalReadingTime || 0,
        averageRating: data.averageRating || 0,
        popularBooks: Array.isArray(data.popularBooks) ? data.popularBooks : [],
        categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : [],
        readingTrends: Array.isArray(data.readingTrends) ? data.readingTrends : [],
        userEngagement: data.userEngagement || {
          activeReaders: 0,
          completionRate: 0,
          averageSessionTime: 0
        }
      };
      
      setAnalytics(safeData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
      
      // Set fallback data to prevent UI crashes
      setAnalytics({
        totalBooks: 0,
        totalReads: 0,
        totalReadingTime: 0,
        averageRating: 0,
        popularBooks: [],
        categoryStats: [],
        readingTrends: [],
        userEngagement: {
          activeReaders: 0,
          completionRate: 0,
          averageSessionTime: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <i className="ri-bar-chart-line text-4xl text-gray-400 mb-4 block"></i>
          <h3 className="text-lg font-medium text-gray-900">No analytics data available</h3>
          <p className="text-gray-500 mt-1">Analytics data will appear here once users start reading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book Analytics</h2>
          <p className="text-gray-600 mt-1">Insights into reading patterns and book performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="ri-book-line text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalBooks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="ri-eye-line text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reads</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalReads.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <i className="ri-time-line text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reading Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(analytics.totalReadingTime)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <i className="ri-star-line text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Popular Books */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Books</h3>
          <div className="space-y-4">
            {analytics.popularBooks.length > 0 ? (
              analytics.popularBooks.map((book, index) => (
                <div key={book.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <img
                    src={book.cover_image_url || '/placeholder-book.jpg'}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-sm text-gray-500 truncate">by {book.author}</p>
                    <div className="flex items-center mt-1">
                      <i className="ri-eye-line text-gray-400 text-xs mr-1"></i>
                      <span className="text-xs text-gray-500">{book.reads} reads</span>
                      <i className="ri-star-fill text-yellow-400 text-xs ml-3 mr-1"></i>
                      <span className="text-xs text-gray-500">{book.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="ri-book-line text-3xl text-gray-400 mb-2 block"></i>
                <p className="text-gray-500">No popular books data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Books by Category</h3>
          <div className="space-y-4">
            {analytics.categoryStats.length > 0 ? (
              analytics.categoryStats.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-500">{category.count} books</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="ri-pie-chart-line text-3xl text-gray-400 mb-2 block"></i>
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-blue-50 rounded-lg mb-3">
              <i className="ri-user-line text-blue-600 text-2xl"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.userEngagement.activeReaders}</p>
            <p className="text-sm text-gray-600">Active Readers</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-green-50 rounded-lg mb-3">
              <i className="ri-check-line text-green-600 text-2xl"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.userEngagement.completionRate}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-purple-50 rounded-lg mb-3">
              <i className="ri-time-line text-purple-600 text-2xl"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatTime(analytics.userEngagement.averageSessionTime)}</p>
            <p className="text-sm text-gray-600">Avg Session Time</p>
          </div>
        </div>
      </div>

      {/* Reading Trends Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Trends</h3>
        {analytics.readingTrends.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.readingTrends.map((trend, index) => {
              const maxReads = Math.max(...analytics.readingTrends.map(t => t.reads));
              const height = maxReads > 0 ? (trend.reads / maxReads) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                    title={`${trend.reads} reads on ${new Date(trend.date).toLocaleDateString()}`}
                  ></div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-line-chart-line text-4xl text-gray-400 mb-2 block"></i>
              <p className="text-gray-500">No reading trends data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}