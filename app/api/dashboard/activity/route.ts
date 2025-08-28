import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { safeToISOString } from '@/utils/dateUtils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Create activities table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default activities if none exist
    const existingActivities = await query('SELECT COUNT(*) FROM user_activities WHERE user_id = $1', [userId]);
    
    if (parseInt(existingActivities.rows[0].count) === 0) {
      await query(`
        INSERT INTO user_activities (user_id, activity_type, title, description)
        VALUES 
          ($1, 'account_created', 'Welcome to ReadnWin!', 'Your account has been successfully created'),
          ($1, 'goal_created', 'Reading Goals Set', 'You have set your reading goals for this period'),
          ($1, 'dashboard_accessed', 'Dashboard Accessed', 'You accessed your reading dashboard')
      `, [userId]);
    }

    // Get user activities
    const result = await query(`
      SELECT 
        id,
        activity_type,
        title,
        description,
        metadata,
        created_at
      FROM user_activities
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    const activities = result.rows.map(row => {
      const safeCreatedAt = safeToISOString(row.created_at);
      
      return {
        id: row.id,
        activity_type: row.activity_type, // Match frontend interface
        title: row.title,
        description: row.description,
        metadata: row.metadata,
        created_at: safeCreatedAt,
        timeAgo: getTimeAgo(safeCreatedAt)
      };
    });

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ 
      success: true,
      error: 'Failed to fetch activities',
      activities: []
    }, { status: 200 });
  }
}

function getTimeAgo(date: string): string {
  try {
    const now = new Date();
    const activityDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(activityDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Just now'; // Future dates
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return activityDate.toLocaleDateString();
  } catch (error) {
    console.warn('Error calculating time ago:', error);
    return 'Unknown time';
  }
}