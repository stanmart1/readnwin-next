
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

  useEffect(() => {
    // Fetch analytics immediately without delay for faster loading
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching analytics...');
      
      // Use Promise.race to add a timeout for faster failure detection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = fetch('/api/admin/analytics?period=month');
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Analytics data:', data);

      if (data.success && data.analytics) {
        const analytics = data.analytics;
        
        // Safely extract values with fallbacks
        const totalUsers = analytics.totalUsers || 0;
        const totalBooks = analytics.totalBooks || 0;
        const totalRevenue = analytics.total_revenue || 0;
        const totalOrders = analytics.total_orders || 0;
        
        setStats([
          {
            title: 'Total Users',
            value: totalUsers.toLocaleString(),
            change: '+12.3%',
            changeType: 'positive',
            icon: 'ri-user-line',
            color: 'bg-blue-500',
            tabId: 'users'
          },
          {
            title: 'Total Books',
            value: totalBooks.toLocaleString(),
            change: '+8.1%',
            changeType: 'positive',
            icon: 'ri-book-line',
            color: 'bg-green-500',
            tabId: 'content'
          },
          {
            title: 'Monthly Sales',
            value: `₦${totalRevenue.toLocaleString()}`,
            change: '+23.4%',
            changeType: 'positive',
            icon: 'ri-money-dollar-circle-line',
            color: 'bg-purple-500',
            tabId: 'orders'
          },
          {
            title: 'Total Orders',
            value: totalOrders.toLocaleString(),
            change: '+5.7%',
            changeType: 'positive',
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
            orders: parseInt(item.orders) || 0,
            users: Math.floor(Math.random() * 1000) + 500 // Placeholder for user growth
          }));
          setTrendData(trendDataFromAPI);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
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
                onClick={fetchAnalytics}
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
            onClick={fetchAnalytics}
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
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                    activity.type === 'review' ? 'ri-flag-line' :
                    'ri-user-line'
                  } text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">
                    {activity.user || activity.book || activity.amount || 'System activity'}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <i className="ri-information-line text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-600">No recent activities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
