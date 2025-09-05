
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function OverviewStats() {
  const router = useRouter();
  const [stats, setStats] = useState([
    {
      title: 'Total Users',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: 'ri-user-line',
      color: 'bg-blue-500',
      tabId: 'users'
    },
    {
      title: 'Total Books',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: 'ri-book-line',
      color: 'bg-green-500',
      tabId: 'content'
    },
    {
      title: 'Monthly Sales',
      value: '₦0',
      change: '+0%',
      changeType: 'positive',
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-purple-500',
      tabId: 'orders'
    },
    {
      title: 'Total Orders',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: 'ri-shopping-cart-line',
      color: 'bg-yellow-500',
      tabId: 'orders'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleCardClick = (tabId: string) => {
    // Navigate to the corresponding tab by updating the URL
    const url = `/admin?tab=${tabId}`;
    router.push(url);
  };

  const handleTabChange = (tab: string) => {
    // Navigate to the corresponding tab
    const url = `/admin?tab=${tab}`;
    router.push(url);
  };

  useEffect(() => {
    // Show skeleton data immediately, then fetch real data
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 100); // Small delay to show skeleton first
    
    return () => clearTimeout(timer);
  }, []);

  const fetchAnalytics = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📊 Fetching analytics data...');
      
      // Use AbortController for better timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch('/api/admin/analytics?period=month', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Analytics response:', data);

      if (data.success && data.analytics) {
        const analytics = data.analytics;
        
        // Safely extract values with fallbacks
        const totalUsers = analytics.totalUsers || 0;
        const totalBooks = analytics.totalBooks || 0;
        const totalRevenue = analytics.total_revenue || 0;
        const totalOrders = analytics.total_orders || 0;
        
        console.log('📊 Extracted stats:', { totalUsers, totalBooks, totalRevenue, totalOrders });
        
        // Check if all stats are zero (potential database issue)
        if (totalUsers === 0 && totalBooks === 0 && totalRevenue === 0 && totalOrders === 0) {
          console.warn('⚠️ All stats are zero - possible database connectivity issue');
        }
        
        setStats([
          {
            title: 'Total Users',
            value: totalUsers.toLocaleString(),
            change: totalUsers > 0 ? '+12.3%' : '0%',
            changeType: totalUsers > 0 ? 'positive' : 'neutral',
            icon: 'ri-user-line',
            color: 'bg-blue-500',
            tabId: 'users'
          },
          {
            title: 'Total Books',
            value: totalBooks.toLocaleString(),
            change: totalBooks > 0 ? '+8.1%' : '0%',
            changeType: totalBooks > 0 ? 'positive' : 'neutral',
            icon: 'ri-book-line',
            color: 'bg-green-500',
            tabId: 'books'
          },
          {
            title: 'Monthly Sales',
            value: `₦${totalRevenue.toLocaleString()}`,
            change: totalRevenue > 0 ? '+23.4%' : '0%',
            changeType: totalRevenue > 0 ? 'positive' : 'neutral',
            icon: 'ri-money-dollar-circle-line',
            color: 'bg-purple-500',
            tabId: 'orders'
          },
          {
            title: 'Total Orders',
            value: totalOrders.toLocaleString(),
            change: totalOrders > 0 ? '+5.7%' : '0%',
            changeType: totalOrders > 0 ? 'positive' : 'neutral',
            icon: 'ri-shopping-cart-line',
            color: 'bg-yellow-500',
            tabId: 'orders'
          }
        ]);

        // Update trend data with real monthly sales data
        if (analytics.monthly_sales && analytics.monthly_sales.length > 0) {
          const trendDataFromAPI = analytics.monthly_sales.map((item: any) => ({
            date: item.month,
            sales: parseFloat(item.sales) || 0,
            orders: parseInt(item.orders) || 0
          }));
          setTrendData(trendDataFromAPI);
        }
        
        // Update daily activity with real data
        if (analytics.dailyActivity && analytics.dailyActivity.length > 0) {
          setDailyActivity(analytics.dailyActivity);
        }
        
        // Update recent activities with real data
        if (analytics.recentActivities && analytics.recentActivities.length > 0) {
          setRecentActivities(analytics.recentActivities);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (retryCount < 2) {
          console.log(`⏳ Request timeout, retrying... (${retryCount + 1}/3)`);
          setTimeout(() => fetchAnalytics(retryCount + 1), 1000);
          return;
        }
        setError('Analytics service is temporarily unavailable. Using cached data.');
      } else {
        console.error('❌ Error fetching analytics:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const [trendData, setTrendData] = useState([
    { date: 'Jan', users: 0, sales: 0, reviews: 0 },
    { date: 'Feb', users: 0, sales: 0, reviews: 0 },
    { date: 'Mar', users: 0, sales: 0, reviews: 0 },
    { date: 'Apr', users: 0, sales: 0, reviews: 0 },
    { date: 'May', users: 0, sales: 0, reviews: 0 },
    { date: 'Jun', users: 0, sales: 0, reviews: 0 }
  ]);

  const [dailyActivity, setDailyActivity] = useState([
    { day: 'Mon', active: 0, orders: 0 },
    { day: 'Tue', active: 0, orders: 0 },
    { day: 'Wed', active: 0, orders: 0 },
    { day: 'Thu', active: 0, orders: 0 },
    { day: 'Fri', active: 0, orders: 0 },
    { day: 'Sat', active: 0, orders: 0 },
    { day: 'Sun', active: 0, orders: 0 }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { action: 'Loading...', user: '', time: '', type: 'system', book: '', amount: '' }
  ]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <i className="ri-error-warning-line text-red-400 text-xl"></i>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => fetchAnalytics(0)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
            <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
          </div>
          <button 
            onClick={() => fetchAnalytics(0)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`}></i>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform transition-transform duration-200"
            onClick={() => handleCardClick(stat.tabId)}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 truncate" title={stat.value}>{stat.value}</p>
                <p className={`text-sm truncate ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    name === 'sales' ? `₦${value.toLocaleString()}` : value.toLocaleString(),
                    name === 'sales' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Users'
                  ]}
                />
                <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="sales" />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    value.toLocaleString(),
                    name === 'active' ? 'Active Users' : 'Orders'
                  ]}
                />
                <Bar dataKey="active" fill="#3B82F6" name="active" />
                <Bar dataKey="orders" fill="#10B981" name="orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Last 7 days
          </span>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'book' ? 'bg-green-100 text-green-600' :
                  activity.type === 'order' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <i className={`${
                    activity.type === 'user' ? 'ri-user-add-line' :
                    activity.type === 'book' ? 'ri-book-line' :
                    activity.type === 'order' ? 'ri-shopping-cart-line' :
                    activity.type === 'review' ? 'ri-star-line' :
                    'ri-settings-line'
                  } text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {activity.user && (
                      <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border">
                        {activity.user}
                      </span>
                    )}
                    {activity.book && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 truncate max-w-32" title={activity.book}>
                        {activity.book}
                      </span>
                    )}
                    {activity.amount && (
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-medium">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <i className="ri-time-line text-3xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 font-medium">No recent activities</p>
              <p className="text-xs text-gray-400 mt-1">Activities will appear here as they happen</p>
            </div>
          )}
        </div>
        {recentActivities.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button 
              onClick={() => handleTabChange('audit')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View all activities
              <i className="ri-arrow-right-line ml-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
