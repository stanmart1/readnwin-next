'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatDateTime } from '@/utils/dateUtils';

// Helper function to format time in a human-readable way
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDateTime(dateString);
};

// Helper function to get time period for grouping
const getTimePeriod = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Recent Activity';
  if (diffInHours < 24) return 'Today';
  if (diffInHours < 48) return 'Yesterday';
  if (diffInHours < 168) return 'This Week';
  return 'Earlier';
};

interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AuditLog() {
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resourceType: '',
    startDate: '',
    endDate: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setAuditLogs(data.logs);
        setTotalPages(data.pagination.pages);
        setTotalLogs(data.pagination.total);
        setCurrentPage(data.pagination.page);
      } else {
        setError('Failed to fetch audit logs');
      }
    } catch (error) {
      setError('Error fetching audit logs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-600';
    if (action.includes('update')) return 'bg-blue-100 text-blue-600';
    if (action.includes('delete')) return 'bg-red-100 text-red-600';
    if (action.includes('login')) return 'bg-purple-100 text-purple-600';
    if (action.includes('logout')) return 'bg-gray-100 text-gray-600';
    if (action.includes('payment')) return 'bg-emerald-100 text-emerald-600';
    if (action.includes('order')) return 'bg-orange-100 text-orange-600';
    return 'bg-yellow-100 text-yellow-600';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return 'ri-add-circle-line';
    if (action.includes('update')) return 'ri-edit-line';
    if (action.includes('delete')) return 'ri-delete-bin-line';
    if (action.includes('login')) return 'ri-login-circle-line';
    if (action.includes('logout')) return 'ri-logout-circle-line';
    if (action.includes('read')) return 'ri-eye-line';
    return 'ri-information-line';
  };

  const getActionDisplayName = (action: string, log: AuditLog) => {
    const userName = log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System';
    
    // User authentication actions
    if (action.includes('login')) return `${userName} signed in`;
    if (action.includes('logout')) return `${userName} signed out`;
    if (action.includes('register')) return `${userName} created an account`;
    if (action.includes('password_reset')) return `${userName} reset their password`;
    
    // CRUD operations with resource context
    if (action.includes('create')) {
      if (action.includes('book')) return `New book was added to the library`;
      if (action.includes('order')) return `${userName} placed a new order`;
      if (action.includes('user')) return `New user account was created`;
      if (action.includes('review')) return `${userName} wrote a book review`;
      return `${userName} created a new resource`;
    }
    
    if (action.includes('update')) {
      if (action.includes('book')) return `Book information was updated`;
      if (action.includes('order')) return `${userName} updated an order`;
      if (action.includes('user')) return `${userName} updated their profile`;
      if (action.includes('review')) return `${userName} edited their review`;
      if (action.includes('profile')) return `${userName} updated their profile`;
      return `${userName} updated a resource`;
    }
    
    if (action.includes('delete')) {
      if (action.includes('book')) return `A book was removed from the library`;
      if (action.includes('order')) return `An order was cancelled`;
      if (action.includes('user')) return `A user account was deleted`;
      if (action.includes('review')) return `A review was removed`;
      return `${userName} deleted a resource`;
    }
    
    if (action.includes('read') || action.includes('view')) {
      if (action.includes('book')) return `${userName} viewed a book`;
      if (action.includes('order')) return `${userName} checked order details`;
      if (action.includes('user')) return `${userName} viewed a profile`;
      if (action.includes('review')) return `${userName} read reviews`;
      return `${userName} viewed content`;
    }
    
    // Payment and order actions
    if (action.includes('payment')) return `${userName} completed a payment`;
    if (action.includes('order_status')) return `Order status was updated`;
    if (action.includes('shipping')) return `Shipping information was updated`;
    
    // Admin actions
    if (action.includes('admin')) return `Admin performed an action`;
    if (action.includes('export')) return `Data was exported`;
    if (action.includes('import')) return `Data was imported`;
    
    // Default: capitalize and format the action
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getResourceTypeDisplayName = (resourceType: string) => {
    if (!resourceType) return 'N/A';
    
    // Common resource types
    const resourceTypeMap: { [key: string]: string } = {
      'book': 'Book',
      'books': 'Book',
      'order': 'Order',
      'orders': 'Order',
      'user': 'User',
      'users': 'User',
      'review': 'Review',
      'reviews': 'Review',
      'category': 'Category',
      'categories': 'Category',
      'payment': 'Payment',
      'payments': 'Payment',
      'shipping': 'Shipping',
      'inventory': 'Inventory',
      'audit_log': 'Audit Log',
      'audit_logs': 'Audit Log',
      'system': 'System',
      'profile': 'User Profile',
      'session': 'User Session',
      'auth': 'Authentication',
      'admin': 'Admin Panel'
    };
    
    const lowerResourceType = resourceType.toLowerCase();
    return resourceTypeMap[lowerResourceType] || resourceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDetails = (details: any, log: AuditLog) => {
    if (!details) return 'No additional details';
    
    if (typeof details === 'string') {
      return details.length > 80 ? details.substring(0, 80) + '...' : details;
    }
    
    if (typeof details === 'object') {
      try {
        // Handle common audit log detail structures with human-readable formatting
        if (details.changes) {
          const changes = Object.entries(details.changes)
            .map(([field, values]: [string, any]) => {
              const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              if (Array.isArray(values) && values.length === 2) {
                return `${fieldName} changed from "${values[0]}" to "${values[1]}"`;
              }
              return `${fieldName} was updated`;
            })
            .join(', ');
          return changes || 'Information was updated';
        }
        
        if (details.amount || details.total_amount) {
          const amount = details.amount || details.total_amount;
          return `Amount: ₦${parseFloat(amount).toLocaleString()}`;
        }
        
        if (details.book_title) {
          return `Book: ${details.book_title}`;
        }
        
        if (details.order_id) {
          return `Order #${details.order_id}`;
        }
        
        if (details.message) {
          return details.message;
        }
        
        if (details.error) {
          return `Issue encountered: ${details.error}`;
        }
        
        // For simple objects, create a readable summary
        const entries = Object.entries(details);
        if (entries.length <= 2) {
          return entries
            .map(([key, value]) => {
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              if (key === 'ip_address') return `From ${value}`;
              if (key === 'user_agent') return `Using ${String(value).split(' ')[0]}`;
              return `${formattedKey}: ${value}`;
            })
            .join(' • ');
        }
        
        // For complex objects, provide a contextual summary
        return `Activity completed with ${entries.length} data points`;
      } catch {
        return 'Activity details recorded';
      }
    }
    
    return String(details);
  };

  const formatAuditDetails = (details: any): string => {
    if (!details) return 'No details available';
    
    if (typeof details === 'string') {
      return details;
    }
    
    if (typeof details === 'object') {
      const formattedDetails: string[] = [];
      
      Object.entries(details).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Format the key to be more readable
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          if (typeof value === 'object') {
            if (Array.isArray(value)) {
              if (value.length === 2 && key === 'changes') {
                // Handle before/after changes
                formattedDetails.push(`${formattedKey}: "${value[0]}" → "${value[1]}"`);
              } else {
                formattedDetails.push(`${formattedKey}: ${value.length} items`);
              }
            } else if (value && typeof value === 'object' && 'message' in value) {
              formattedDetails.push(`${formattedKey}: ${(value as any).message}`);
            } else {
              const subEntries = Object.entries(value);
              if (subEntries.length <= 2) {
                const subDetails = subEntries
                  .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
                  .join(', ');
                formattedDetails.push(`${formattedKey}: ${subDetails}`);
              } else {
                formattedDetails.push(`${formattedKey}: ${subEntries.length} fields`);
              }
            }
          } else {
            // Format common field types
            if (key === 'ip_address') {
              formattedDetails.push(`IP Address: ${value}`);
            } else if (key === 'user_agent' && typeof value === 'string') {
              formattedDetails.push(`Browser: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
            } else if (key === 'timestamp' && typeof value === 'string') {
              formattedDetails.push(`Time: ${new Date(value).toLocaleString()}`);
            } else {
              formattedDetails.push(`${formattedKey}: ${value}`);
            }
          }
        }
      });
      
      return formattedDetails.join('\n');
    }
    
    return String(details);
  };

  const handleExport = () => {
    // Implementation for CSV export
    const csvContent = [
      ['ID', 'Action', 'User', 'Resource Type', 'Resource ID', 'IP Address', 'Timestamp', 'Details'],
      ...auditLogs.map(log => [
        log.id,
        log.action,
        log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System',
        getResourceTypeDisplayName(log.resource_type || ''),
        log.resource_id || 'N/A',
        log.ip_address || 'N/A',
        formatDateTime(log.created_at),
        formatDetails(log.details)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLogDetails(log);
    setShowDetailsModal(true);
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      resourceType: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading activities...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <i className="ri-error-warning-line text-red-400 text-xl"></i>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
            <p className="text-gray-600 mt-1">Track user activities and system events</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => fetchAuditLogs(currentPage)}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 flex items-center"
            >
              <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              Refresh
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 flex items-center"
            >
              <i className="ri-download-line mr-2"></i>
              Export
            </button>
          </div>
        </div>
        {totalLogs > 0 && (
          <div className="flex items-center justify-between text-sm border-t pt-4">
            <span className="text-gray-600">Showing {auditLogs.length} of {totalLogs.toLocaleString()} activities</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
          <input
            type="text"
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search actions..."
          />
          <input
            type="text"
            value={filters.resourceType}
            onChange={(e) => setFilters({...filters, resourceType: e.target.value})}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resource type..."
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(filters.action || filters.resourceType || filters.startDate || filters.endDate || filters.userId) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <i className="ri-close-line mr-1"></i>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Activity Feed - Recent Activities Style */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Activities</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {totalLogs.toLocaleString()} total activities
          </span>
        </div>
        <div className="space-y-3">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => {
              const actionType = log.action.includes('user') ? 'user' :
                               log.action.includes('book') ? 'book' :
                               log.action.includes('order') ? 'order' :
                               log.action.includes('review') ? 'review' :
                               'system';
              
              return (
                <div 
                  key={log.id} 
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleViewDetails(log)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    actionType === 'user' ? 'bg-blue-100 text-blue-600' :
                    actionType === 'book' ? 'bg-green-100 text-green-600' :
                    actionType === 'order' ? 'bg-purple-100 text-purple-600' :
                    actionType === 'review' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={`${
                      actionType === 'user' ? 'ri-user-line' :
                      actionType === 'book' ? 'ri-book-line' :
                      actionType === 'order' ? 'ri-shopping-cart-line' :
                      actionType === 'review' ? 'ri-star-line' :
                      'ri-settings-line'
                    } text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{getActionDisplayName(log.action, log)}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {log.user && (
                        <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border">
                          {log.user.first_name} {log.user.last_name}
                        </span>
                      )}
                      {log.resource_type && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          {getResourceTypeDisplayName(log.resource_type)}
                        </span>
                      )}
                      {log.resource_id && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          #{log.resource_id}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {formatDetails(log.details, log)}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-gray-500">{getTimeAgo(log.created_at)}</span>
                    <div className="text-xs text-gray-400 mt-1">{formatDateTime(log.created_at).split(' ')[1]}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <i className="ri-time-line text-3xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 font-medium">No activities found</p>
              <p className="text-xs text-gray-400 mt-1">Activities will appear here as they happen</p>
            </div>
          )}
        </div>
        {auditLogs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                {showFilters ? 'Hide' : 'Show'} detailed view
                <i className={`ri-arrow-${showFilters ? 'up' : 'down'}-line ml-1`}></i>
              </button>
              <span className="text-xs text-gray-500">
                Click any activity for details
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed View Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Detailed View</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <i className="ri-table-line"></i>
            <span>Toggle Table View</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    When
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${getActionColor(log.action)} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                          <i className={`${getActionIcon(log.action)} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900">{getActionDisplayName(log.action, log)}</span>
                          <div className="text-xs text-gray-500">{log.action}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {log.user ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                          {log.user.first_name} {log.user.last_name}
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-200">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {log.resource_type && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                            {getResourceTypeDisplayName(log.resource_type)}
                          </span>
                        )}
                        {log.resource_id && (
                          <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-200">
                            #{log.resource_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {log.ip_address && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                          {log.ip_address}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-700">
                        {getTimeAgo(log.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(log.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                      >
                        <i className="ri-eye-line mr-1"></i>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing {auditLogs.length} of {totalLogs} activities
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button 
              onClick={() => fetchAuditLogs(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {currentPage}
            </span>
            <button 
              onClick={() => fetchAuditLogs(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>



      {/* Details Modal */}
      {showDetailsModal && selectedLogDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Activity Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Activity Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">What happened:</span> {getActionDisplayName(selectedLogDetails.action, selectedLogDetails)}</div>
                      <div><span className="font-medium">User:</span> {selectedLogDetails.user ? `${selectedLogDetails.user.first_name} ${selectedLogDetails.user.last_name}` : 'System'}</div>
                      <div><span className="font-medium">Resource Type:</span> {getResourceTypeDisplayName(selectedLogDetails.resource_type || '')}</div>
                      <div><span className="font-medium">Resource ID:</span> {selectedLogDetails.resource_id || 'N/A'}</div>
                      <div><span className="font-medium">Timestamp:</span> {formatDateTime(selectedLogDetails.created_at)}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">IP Address:</span> {selectedLogDetails.ip_address || 'N/A'}</div>
                      <div><span className="font-medium">User Agent:</span> {selectedLogDetails.user_agent || 'N/A'}</div>
                      <div><span className="font-medium">Log ID:</span> {selectedLogDetails.id}</div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                {selectedLogDetails.details && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {formatDetails(selectedLogDetails.details)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw JSON (for developers) */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Raw Data (JSON)</h4>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-xs text-green-400 overflow-x-auto">
                      {JSON.stringify(selectedLogDetails, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 