'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function NotificationManagement() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Feature temporarily disabled for performance optimization</p>
        </div>
        <div className="flex space-x-2">
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50"
          >
            <i className="ri-add-line mr-2"></i>
            Create Notification
          </button>
        </div>
      </div>

      {/* Disabled Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-information-line text-yellow-400 text-xl flex-shrink-0 mt-0.5"></i>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Feature Temporarily Disabled</h3>
            <p className="text-sm text-yellow-700 mt-1">
              The notifications feature has been temporarily disabled for performance optimization.
            </p>
          </div>
        </div>
      </div>

      {/* Disabled Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <i className="ri-notification-off-line text-6xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications Feature Disabled</h3>
          <p className="text-gray-600">
            This feature is temporarily unavailable while we optimize system performance.
          </p>
        </div>
      </div>
    </div>
  );
}