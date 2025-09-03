'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface CacheStats {
  cache_hits: number;
  cache_misses: number;
  total_requests: number;
  hit_rate: number;
  cache_size_mb: number;
  cached_items: number;
  total_images: number;
  last_cleared: string;
}

export default function ImageCacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/cache');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear the image cache? This will temporarily slow down image loading.')) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/admin/cache', { method: 'DELETE' });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        await loadStats(); // Reload stats
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load cache statistics
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cache Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.hit_rate}%</div>
          <div className="text-sm text-gray-600">Hit Rate</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.cache_size_mb}</div>
          <div className="text-sm text-gray-600">Cache Size (MB)</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.cached_items}</div>
          <div className="text-sm text-gray-600">Cached Items</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{stats.total_images}</div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white p-4 rounded-lg border">
        <h5 className="font-medium text-gray-900 mb-3">Cache Performance</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cache Hits:</span>
            <span className="ml-2 font-medium text-green-600">{stats.cache_hits.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Cache Misses:</span>
            <span className="ml-2 font-medium text-red-600">{stats.cache_misses.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Requests:</span>
            <span className="ml-2 font-medium">{stats.total_requests.toLocaleString()}</span>
          </div>
        </div>
        
        {stats.last_cleared && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
            Last cleared: {new Date(stats.last_cleared).toLocaleString()}
          </div>
        )}
      </div>

      {/* Cache Actions */}
      <div className="flex gap-3">
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          <i className="ri-refresh-line mr-1"></i>
          Refresh Stats
        </button>
        <button
          onClick={clearCache}
          disabled={clearing}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
        >
          {clearing ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-1"></i>
              Clearing...
            </>
          ) : (
            <>
              <i className="ri-delete-bin-line mr-1"></i>
              Clear Cache
            </>
          )}
        </button>
      </div>

      {/* Cache Health Indicator */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Cache Health</span>
          <div className="flex items-center gap-2">
            {stats.hit_rate >= 80 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Excellent</span>
              </>
            ) : stats.hit_rate >= 60 ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600">Good</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600">Needs Attention</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.hit_rate >= 80 ? 'bg-green-500' : 
                stats.hit_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(stats.hit_rate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}