'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardState {
  userStats: any;
  readingProgress: any;
  libraryItems: any[];
  notifications: any[];
  activities: any[];
  goals: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_STATS'; payload: any }
  | { type: 'SET_READING_PROGRESS'; payload: any }
  | { type: 'SET_LIBRARY_ITEMS'; payload: any[] }
  | { type: 'SET_NOTIFICATIONS'; payload: any[] }
  | { type: 'SET_ACTIVITIES'; payload: any[] }
  | { type: 'SET_GOALS'; payload: any[] }
  | { type: 'UPDATE_LIBRARY_ITEM'; payload: { id: number; updates: any } }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'MARK_NOTIFICATION_READ'; payload: number }
  | { type: 'REFRESH_DATA' };

const initialState: DashboardState = {
  userStats: null,
  readingProgress: null,
  libraryItems: [],
  notifications: [],
  activities: [],
  goals: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER_STATS':
      return { ...state, userStats: action.payload, lastUpdated: new Date() };
    
    case 'SET_READING_PROGRESS':
      return { ...state, readingProgress: action.payload, lastUpdated: new Date() };
    
    case 'SET_LIBRARY_ITEMS':
      return { ...state, libraryItems: action.payload, lastUpdated: new Date() };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, lastUpdated: new Date() };
    
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload, lastUpdated: new Date() };
    
    case 'SET_GOALS':
      return { ...state, goals: action.payload, lastUpdated: new Date() };
    
    case 'UPDATE_LIBRARY_ITEM':
      return {
        ...state,
        libraryItems: state.libraryItems.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        ),
        lastUpdated: new Date()
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        lastUpdated: new Date()
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, is_read: true }
            : notification
        ),
        lastUpdated: new Date()
      };
    
    case 'REFRESH_DATA':
      return { ...state, loading: true, error: null };
    
    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  refreshData: () => void;
  fetchUserStats: () => Promise<void>;
  fetchReadingProgress: () => Promise<void>;
  fetchLibraryItems: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchGoals: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { data: session } = useSession();

  const fetchUserStats = async () => {
    console.log('🔍 DashboardContext - Session:', session ? 'Present' : 'Not present');
    console.log('🔍 DashboardContext - Session user:', session?.user);
    
    if (!session?.user?.id) {
      console.log('❌ DashboardContext - No session or user ID');
      return;
    }
    
    try {
      console.log('🔍 DashboardContext - Fetching user stats...');
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch('/api/dashboard/stats');
      console.log('🔍 DashboardContext - Stats response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DashboardContext - Stats data:', data);
        dispatch({ type: 'SET_USER_STATS', payload: data.stats });
      } else {
        const errorData = await response.json();
        console.error('❌ DashboardContext - Stats response error:', errorData);
        throw new Error(`Failed to fetch user stats: ${response.status} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user statistics' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchReadingProgress = async () => {
    if (!session?.user?.id) return;
    
    try {
      console.log('🔍 DashboardContext - Fetching reading progress...');
      const response = await fetch('/api/dashboard/reading-progress');
      console.log('🔍 DashboardContext - Reading progress response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DashboardContext - Reading progress data:', data);
        dispatch({ type: 'SET_READING_PROGRESS', payload: data });
      } else {
        const errorData = await response.json();
        console.error('❌ DashboardContext - Reading progress response error:', errorData);
        throw new Error(`Failed to fetch reading progress: ${response.status} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      // Don't throw here to prevent blocking other requests
    }
  };

  const fetchLibraryItems = async () => {
    if (!session?.user?.id) return;
    
    try {
      console.log('🔍 DashboardContext - Fetching library items...');
      const response = await fetch('/api/user/library');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_LIBRARY_ITEMS', payload: data.libraryItems || [] });
      } else {
        const errorData = await response.json();
        console.error('❌ DashboardContext - Library items response error:', errorData);
        throw new Error(`Failed to fetch library items: ${response.status} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching library items:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    
    try {
      console.log('🔍 DashboardContext - Fetching notifications...');
      const response = await fetch('/api/dashboard/notifications');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: data.notifications || [] });
      } else {
        const errorData = await response.json();
        console.error('❌ DashboardContext - Notifications response error:', errorData);
        throw new Error(`Failed to fetch notifications: ${response.status} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchActivities = async () => {
    if (!session?.user?.id) return;
    
    try {
      console.log('🔍 DashboardContext - Fetching activities...');
      const response = await fetch('/api/dashboard/activity');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_ACTIVITIES', payload: data.activities || [] });
      } else {
        const errorData = await response.json();
        console.error('❌ DashboardContext - Activities response error:', errorData);
        throw new Error(`Failed to fetch activities: ${response.status} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchGoals = async () => {
    if (!session?.user?.id) return;
    
    try {
      console.log('🔍 DashboardContext - Fetching goals...');
      const response = await fetch('/api/dashboard/goals');
      console.log('🔍 DashboardContext - Goals response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DashboardContext - Goals data:', data);
        dispatch({ type: 'SET_GOALS', payload: data.goals || [] });
      } else {
        const errorData = await response.json();
        console.error('❌ DashboardContext - Goals response error:', errorData);
        throw new Error(`Failed to fetch goals: ${response.status} ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const refreshData = async () => {
    console.log('🔍 DashboardContext - refreshData called');
    console.log('🔍 DashboardContext - Session in refreshData:', session ? 'Present' : 'Not present');
    dispatch({ type: 'REFRESH_DATA' });
    
    // Load data sequentially to reduce connection pool pressure
    try {
      // Load critical data first
      await fetchUserStats();
      await fetchReadingProgress();
      
      // Load secondary data
      await Promise.all([
        fetchLibraryItems(),
        fetchNotifications()
      ]);
      
      // Load remaining data
      await Promise.all([
        fetchActivities(),
        fetchGoals()
      ]);
      
      console.log('✅ DashboardContext - All data loaded successfully');
    } catch (error) {
      console.error('❌ DashboardContext - Error loading data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('🔍 DashboardContext - useEffect triggered');
    console.log('🔍 DashboardContext - Session in useEffect:', session ? 'Present' : 'Not present');
    console.log('🔍 DashboardContext - Session user ID:', session?.user?.id);
    
    if (session?.user?.id) {
      console.log('🔍 DashboardContext - Calling refreshData from useEffect');
      refreshData();
    } else {
      console.log('❌ DashboardContext - No session or user ID in useEffect');
    }
  }, [session]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (session?.user?.id) {
      const interval = setInterval(refreshData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const value: DashboardContextType = {
    state,
    dispatch,
    refreshData,
    fetchUserStats,
    fetchReadingProgress,
    fetchLibraryItems,
    fetchNotifications,
    fetchActivities,
    fetchGoals,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 