import { query } from '@/utils/database';

export interface ActivityData {
  user_id: number;
  activity_type: 'completed' | 'review' | 'started' | 'achievement' | 'purchase' | 'bookmark' | 'goal_reached';
  title: string;
  description?: string;
  book_id?: number;
  metadata?: any;
}

export class ActivityTracker {
  static async createActivity(activityData: ActivityData) {
    try {
      const result = await query(`
        INSERT INTO user_activity (user_id, activity_type, title, description, book_id, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        activityData.user_id,
        activityData.activity_type,
        activityData.title,
        activityData.description || null,
        activityData.book_id || null,
        activityData.metadata ? JSON.stringify(activityData.metadata) : null
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Track when user starts reading a book
  static async trackBookStarted(userId: number, bookId: number, bookTitle: string) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'started',
      title: `Started reading "${bookTitle}"`,
      book_id: bookId,
      metadata: { action: 'book_started' }
    });
  }

  // Track when user completes a book
  static async trackBookCompleted(userId: number, bookId: number, bookTitle: string) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'completed',
      title: `Finished reading "${bookTitle}"`,
      book_id: bookId,
      metadata: { action: 'book_completed' }
    });
  }

  // Track when user writes a review
  static async trackReviewWritten(userId: number, bookId: number, bookTitle: string, rating: number) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'review',
      title: `Wrote a ${rating}-star review for "${bookTitle}"`,
      book_id: bookId,
      metadata: { action: 'review_written', rating }
    });
  }

  // Track when user purchases a book
  static async trackBookPurchased(userId: number, bookId: number, bookTitle: string) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'purchase',
      title: `Purchased "${bookTitle}"`,
      book_id: bookId,
      metadata: { action: 'book_purchased' }
    });
  }

  // Track when user adds a book to wishlist
  static async trackBookWishlisted(userId: number, bookId: number, bookTitle: string) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'bookmark',
      title: `Added "${bookTitle}" to wishlist`,
      book_id: bookId,
      metadata: { action: 'book_wishlisted' }
    });
  }

  // Track when user reaches a reading goal
  static async trackGoalReached(userId: number, goalType: string, goalValue: number) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'goal_reached',
      title: `Reached ${goalValue} ${goalType} goal!`,
      metadata: { action: 'goal_reached', goal_type: goalType, goal_value: goalValue }
    });
  }

  // Track when user achieves something
  static async trackAchievement(userId: number, achievementTitle: string, achievementType: string) {
    return this.createActivity({
      user_id: userId,
      activity_type: 'achievement',
      title: achievementTitle,
      metadata: { action: 'achievement_earned', achievement_type: achievementType }
    });
  }
} 