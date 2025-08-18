import { query } from './database';

interface Achievement {
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  priority: number;
}

export class AchievementChecker {
  static async checkAndAwardAchievements(userId: number): Promise<string[]> {
    const awardedAchievements: string[] = [];

    try {
      // Get all available achievements
      const achievementsResult = await query(`
        SELECT * FROM achievements
        ORDER BY priority ASC
      `);
      const achievements: Achievement[] = achievementsResult.rows;

      // Get user's existing achievements
      const userAchievementsResult = await query(`
        SELECT achievement_type FROM user_achievements
        WHERE user_id = $1
      `, [userId]);
      const userAchievements = userAchievementsResult.rows.map(ua => ua.achievement_type);

      // Check each achievement
      for (const achievement of achievements) {
        if (userAchievements.includes(achievement.achievement_type)) {
          continue; // Already earned
        }

        const shouldAward = await this.checkAchievementCondition(userId, achievement);
        if (shouldAward) {
          await this.awardAchievement(userId, achievement.achievement_type);
          awardedAchievements.push(achievement.title);
        }
      }

      return awardedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  private static async checkAchievementCondition(userId: number, achievement: Achievement): Promise<boolean> {
    switch (achievement.condition_type) {
      case 'books_completed':
        return await this.checkBooksCompleted(userId, achievement.condition_value);
      
      case 'reading_streak':
        return await this.checkReadingStreak(userId, achievement.condition_value);
      
      case 'total_pages':
        return await this.checkTotalPages(userId, achievement.condition_value);
      
      case 'total_hours':
        return await this.checkTotalHours(userId, achievement.condition_value);
      
      case 'reviews_written':
        return await this.checkReviewsWritten(userId, achievement.condition_value);
      
      case 'genres_read':
        return await this.checkGenresRead(userId, achievement.condition_value);
      
      case 'monthly_books':
        return await this.checkMonthlyBooks(userId, achievement.condition_value);
      
      default:
        return false;
    }
  }

  private static async checkBooksCompleted(userId: number, requiredCount: number): Promise<boolean> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM reading_progress
      WHERE user_id = $1 AND progress_percentage >= 100
    `, [userId]);
    
    return parseInt(result.rows[0]?.count || '0') >= requiredCount;
  }

  private static async checkReadingStreak(userId: number, requiredDays: number): Promise<boolean> {
    const result = await query(`
      WITH reading_days AS (
        SELECT DISTINCT DATE(last_read_at) as read_date
        FROM reading_progress
        WHERE user_id = $1 AND last_read_at >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY read_date DESC
      ),
      streak_calc AS (
        SELECT 
          read_date,
          ROW_NUMBER() OVER (ORDER BY read_date DESC) as rn,
          read_date + (ROW_NUMBER() OVER (ORDER BY read_date DESC) - 1) * INTERVAL '1 day' as expected_date
        FROM reading_days
      )
      SELECT COUNT(*) as streak
      FROM streak_calc
      WHERE read_date = expected_date
      AND read_date >= CURRENT_DATE - INTERVAL '30 days'
    `, [userId]);
    
    return parseInt(result.rows[0]?.streak || '0') >= requiredDays;
  }

  private static async checkTotalPages(userId: number, requiredPages: number): Promise<boolean> {
    const result = await query(`
      SELECT COALESCE(SUM(current_page), 0) as total_pages
      FROM reading_progress
      WHERE user_id = $1
    `, [userId]);
    
    return parseInt(result.rows[0]?.total_pages || '0') >= requiredPages;
  }

  private static async checkTotalHours(userId: number, requiredHours: number): Promise<boolean> {
    const result = await query(`
      SELECT COALESCE(SUM(current_page * 0.016), 0) as total_hours
      FROM reading_progress
      WHERE user_id = $1
    `, [userId]);
    
    return parseFloat(result.rows[0]?.total_hours || '0') >= requiredHours;
  }

  private static async checkReviewsWritten(userId: number, requiredCount: number): Promise<boolean> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM book_reviews
      WHERE user_id = $1 AND status = 'approved'
    `, [userId]);
    
    return parseInt(result.rows[0]?.count || '0') >= requiredCount;
  }

  private static async checkGenresRead(userId: number, requiredGenres: number): Promise<boolean> {
    const result = await query(`
      SELECT COUNT(DISTINCT c.name) as genres
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = $1 AND rp.progress_percentage >= 100
    `, [userId]);
    
    return parseInt(result.rows[0]?.genres || '0') >= requiredGenres;
  }

  private static async checkMonthlyBooks(userId: number, requiredBooks: number): Promise<boolean> {
    const result = await query(`
      SELECT COUNT(DISTINCT book_id) as books
      FROM reading_progress
      WHERE user_id = $1 
        AND progress_percentage >= 100
        AND EXTRACT(YEAR FROM last_read_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM last_read_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    `, [userId]);
    
    return parseInt(result.rows[0]?.books || '0') >= requiredBooks;
  }

  private static async awardAchievement(userId: number, achievementType: string): Promise<void> {
    await query(`
      INSERT INTO user_achievements (user_id, achievement_type, earned_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, achievement_type) DO NOTHING
    `, [userId, achievementType]);

    // Create notification for the achievement
    const achievementResult = await query(`
      SELECT title, description FROM achievements
      WHERE achievement_type = $1
    `, [achievementType]);

    if (achievementResult.rows.length > 0) {
      const achievement = achievementResult.rows[0];
      await query(`
        INSERT INTO user_notifications (user_id, type, title, message, metadata)
        VALUES ($1, 'achievement', $2, $3, $4)
      `, [
        userId,
        `Achievement Unlocked: ${achievement.title}`,
        achievement.description,
        JSON.stringify({ achievement_type: achievementType })
      ]);
    }
  }

  static async initializeDefaultAchievements(): Promise<void> {
    const defaultAchievements = [
      {
        achievement_type: 'first_book',
        title: 'First Steps',
        description: 'Complete your first book',
        icon: 'ri-book-open-line',
        condition_type: 'books_completed',
        condition_value: 1,
        priority: 1
      },
      {
        achievement_type: 'speed_reader',
        title: 'Speed Reader',
        description: 'Read 5 books in a month',
        icon: 'ri-flashlight-line',
        condition_type: 'monthly_books',
        condition_value: 5,
        priority: 2
      },
      {
        achievement_type: 'diverse_reader',
        title: 'Diverse Reader',
        description: 'Read books from 5 different genres',
        icon: 'ri-book-line',
        condition_type: 'genres_read',
        condition_value: 5,
        priority: 3
      },
      {
        achievement_type: 'consistent_reader',
        title: 'Consistent Reader',
        description: 'Read for 30 days straight',
        icon: 'ri-calendar-line',
        condition_type: 'reading_streak',
        condition_value: 30,
        priority: 4
      },
      {
        achievement_type: 'social_reader',
        title: 'Social Reader',
        description: 'Write 20 reviews',
        icon: 'ri-chat-1-line',
        condition_type: 'reviews_written',
        condition_value: 20,
        priority: 5
      },
      {
        achievement_type: 'bookworm',
        title: 'Bookworm',
        description: 'Read 50 books',
        icon: 'ri-book-2-line',
        condition_type: 'books_completed',
        condition_value: 50,
        priority: 6
      },
      {
        achievement_type: 'page_turner',
        title: 'Page Turner',
        description: 'Read 10,000 pages',
        icon: 'ri-file-text-line',
        condition_type: 'total_pages',
        condition_value: 10000,
        priority: 7
      },
      {
        achievement_type: 'time_reader',
        title: 'Time Reader',
        description: 'Spend 100 hours reading',
        icon: 'ri-time-line',
        condition_type: 'total_hours',
        condition_value: 100,
        priority: 8
      }
    ];

    for (const achievement of defaultAchievements) {
      await query(`
        INSERT INTO achievements (
          achievement_type, title, description, icon, 
          condition_type, condition_value, priority
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (achievement_type) DO NOTHING
      `, [
        achievement.achievement_type,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.condition_type,
        achievement.condition_value,
        achievement.priority
      ]);
    }
  }
} 