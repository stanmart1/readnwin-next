'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UsePermissionsReturn {
  permissions: string[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

export function usePermissions(skipForAdmin: boolean = false): UsePermissionsReturn {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!session?.user?.id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    // Skip API call for admin users - they have all permissions
    if (skipForAdmin && (session.user.role === 'admin' || session.user.role === 'super_admin')) {
      setPermissions(['*']); // Wildcard permission for admins
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/permissions');
      const data = await response.json();

      if (data.success) {
        setPermissions(data.permissions);
      } else {
        throw new Error(data.error || 'Failed to fetch permissions');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.role, skipForAdmin]);

  const hasPermission = useCallback((permission: string): boolean => {
    // Admin users have all permissions
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionsToCheck: string[]): boolean => {
    // Admin users have all permissions
    if (permissions.includes('*')) return true;
    return permissionsToCheck.some(permission => permissions.includes(permission));
  }, [permissions]);

  const hasAllPermissions = useCallback((permissionsToCheck: string[]): boolean => {
    // Admin users have all permissions
    if (permissions.includes('*')) return true;
    return permissionsToCheck.every(permission => permissions.includes(permission));
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions
  };
} 