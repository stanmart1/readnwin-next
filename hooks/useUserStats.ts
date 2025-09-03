import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserStats {
  booksRead: number;
  completedBooks: number;
  currentlyReading: number;
  totalBooks: number;
  totalPagesRead: number;
  totalHours: number;
  streak: number;
  avgProgress: number;
  favoriteBooks: number;
  recentPurchases: number;
  totalGoals: number;
  completedGoals: number;
  avgGoalProgress: number;
  averageRating: number;
  readingSessions: number;
  totalReadingTime: number;
}

export function useUserStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        throw new Error(result.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error in useUserStats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set default stats even on error
      setStats({
        booksRead: 0,
        completedBooks: 0,
        currentlyReading: 0,
        totalBooks: 0,
        totalPagesRead: 0,
        totalHours: 0,
        streak: 0,
        avgProgress: 0,
        favoriteBooks: 0,
        recentPurchases: 0,
        totalGoals: 0,
        completedGoals: 0,
        avgGoalProgress: 0,
        averageRating: 0,
        readingSessions: 0,
        totalReadingTime: 0
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}