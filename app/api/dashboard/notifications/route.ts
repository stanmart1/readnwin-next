import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Create notifications table if it doesn't exist
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS user_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT FALSE,
          action_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL
        )
      `);

      // Insert default notification if none exist
      const existingNotifications = await query('SELECT COUNT(*) FROM user_notifications WHERE user_id = $1', [userId]);
      
      if (parseInt(existingNotifications.rows[0].count) === 0) {
        await query(`
          INSERT INTO user_notifications (user_id, title, message, type)
          VALUES ($1, 'Welcome to ReadnWin!', 'Start your reading journey by exploring our book collection.', 'welcome')
        `, [userId]);
      }

      // Get user notifications
      const result = await query(`
        SELECT 
          id,
          title,
          message,
          type,
          is_read,
          action_url,
          created_at,
          read_at
        FROM user_notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId]);

      const notifications = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        isRead: row.is_read,
        actionUrl: row.action_url,
        createdAt: row.created_at,
        readAt: row.read_at,
        timeAgo: getTimeAgo(row.created_at)
      }));

      return NextResponse.json({
        success: true,
        notifications
      });
    } catch (dbError) {
      console.error('Database error in notifications:', dbError);
      // Return empty notifications array instead of failing
      return NextResponse.json({
        success: true,
        notifications: []
      });
    }

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      success: true,
      error: 'Failed to fetch notifications',
      notifications: []
    }, { status: 200 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { notificationId, isRead } = await request.json();

    await query(`
      UPDATE user_notifications 
      SET is_read = $1, read_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = $2 AND user_id = $3
    `, [isRead, notificationId, userId]);

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update notification'
    }, { status: 500 });
  }
}

function getTimeAgo(date: string): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return notificationDate.toLocaleDateString();
}