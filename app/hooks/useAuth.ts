'use client';

import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Add debugging for session changes
  console.log('🔍 useAuth hook - Session status:', {
    status,
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    isAuthenticated: status === 'authenticated'
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔍 Login attempt for:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('🔍 SignIn result:', result);

      if (result?.error) {
        console.error('🔍 Login error:', result.error);
        throw new Error(result.error);
      }

      // If login was successful, force session refresh to ensure immediate update
      if (result?.ok) {
        console.log('🔍 Login successful, refreshing session...');
        // Force session refresh to ensure immediate update
        try {
          await getSession();
          console.log('🔍 Session refreshed successfully after login');
        } catch (error) {
          console.log('Session refresh error (non-critical):', error);
        }
        
        return true;
      }

      console.log('🔍 Login failed - result.ok is false');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  return {
    user: session?.user || null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    status,
  };
}; 