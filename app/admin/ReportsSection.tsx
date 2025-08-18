
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatNumber } from '@/utils/dateUtils';

export default function ReportsSection() {
  const engagementData = [
    { month: 'Jan', users: 8500, sessions: 25600, pageViews: 156000 },
    { month: 'Feb', users: 9200, sessions: 28400, pageViews: 168000 },
    { month: 'Mar', users: 10100, sessions: 31200, pageViews: 182000 },
    { month: 'Apr', users: 11200, sessions: 34800, pageViews: 198000 },
    { month: 'May', users: 12100, sessions: 38200, pageViews: 215000 },
    { month: 'Jun', users: 12847, sessions: 41200, pageViews: 234000 }
  ];

  const popularBooks = [
    { title: 'Atomic Habits', views: 15234, rating: 4.9, reviews: 2156 },
    { title: 'The Psychology of Money', views: 12876, rating: 4.8, reviews: 1247 },
    { title: 'Dune', views: 10987, rating: 4.7, reviews: 987 },
    { title: 'The Midnight Library', views: 9876, rating: 4.6, reviews: 876 },
    { title: 'Where the Crawdads Sing', views: 8765, rating: 4.5, reviews: 743 }
  ];

  const reviewAnalytics = [
    { rating: 5, count: 1247, percentage: 62 },
    { rating: 4, count: 456, percentage: 23 },
    { rating: 3, count: 189, percentage: 9 },
    { rating: 2, count: 78, percentage: 4 },
    { rating: 1, count: 34, percentage: 2 }
  ];

  const reports = [
    {
      title: 'Monthly Sales Report',
      description: 'Comprehensive sales analysis for the current month',
      lastGenerated: '2025-06-15',
      type: 'sales',
      status: 'ready'
    },
    {
      title: 'User Engagement Report',
      description: 'User activity and engagement metrics',
      lastGenerated: '2025-06-14',
      type: 'engagement',
      status: 'ready'
    },
    {
      title: 'Inventory Report',
      description: 'Current stock levels and inventory management',
      lastGenerated: '2025-06-13',
      type: 'inventory',
      status: 'generating'
    },
    {
      title: 'Author Performance Report',
      description: 'Author sales and performance analytics',
      lastGenerated: '2025-06-12',
      type: 'authors',
      status: 'ready'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{report.title}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  report.status === 'ready' ? 'bg-green-100 text-green-800' :
                  report.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Last generated: {report.lastGenerated}
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                    Generate
                  </button>
                  <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Engagement */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Review Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Distribution</h3>
          <div className="space-y-3">
            {reviewAnalytics.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600">{item.rating}</span>
                  <i className="ri-star-fill text-yellow-400 text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Books */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Books Tracking</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {popularBooks.map((book, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{book.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(book.views)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <span>{book.rating}</span>
                      <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{book.reviews}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <i className="ri-arrow-up-line text-green-600"></i>
                      <span className="text-green-600">+{Math.floor(Math.random() * 20) + 5}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
