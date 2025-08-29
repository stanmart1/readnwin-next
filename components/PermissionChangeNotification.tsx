'use client';

import { useEffect, useState } from 'react';
import { usePermissions } from '@/app/hooks/usePermissions';

export default function PermissionChangeNotification() {
  const { refreshPermissions } = usePermissions();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Listen for permission change events
    const handlePermissionChange = () => {
      setShowNotification(true);
    };

    // Listen for custom events from admin actions
    window.addEventListener('permissionsUpdated', handlePermissionChange);
    
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionChange);
    };
  }, []);

  const handleRefresh = async () => {
    await refreshPermissions();
    setShowNotification(false);
    // Optionally reload the page to ensure all components update
    window.location.reload();
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <i className="ri-information-line text-xl flex-shrink-0 mt-0.5"></i>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Permissions Updated</h4>
          <p className="text-sm mb-3">Your account permissions have been updated. Please refresh to see the changes.</p>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              Refresh Now
            </button>
            <button
              onClick={() => setShowNotification(false)}
              className="text-blue-200 hover:text-white text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}