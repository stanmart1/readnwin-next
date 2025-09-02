'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, ProfileUpdateData } from '../types/profile';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdateData) => {
    try {
      setError(null);
      
      // Sanitize input data
      const sanitizedUpdates = {
        ...updates,
        firstName: updates.firstName?.trim().replace(/<[^>]*>/g, ''),
        lastName: updates.lastName?.trim().replace(/<[^>]*>/g, ''),
        bio: updates.bio?.trim().replace(/<[^>]*>/g, ''),
      };
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedUpdates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      // Refetch the profile to get updated data
      await fetchProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}