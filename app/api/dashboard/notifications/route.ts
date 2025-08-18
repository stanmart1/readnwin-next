import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in notifications API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';

    let notificationsQuery = `
      SELECT * FROM user_notifications
      WHERE user_id = $1
    `;
    const queryParams = [userId];

    if (unreadOnly) {
      notificationsQuery += ` AND is_read = FALSE`;
    }

    notificationsQuery += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const result = await query(notificationsQuery, queryParams);

    // Get unread count
    const unreadCountResult = await query(`
      SELECT COUNT(*) as count
      FROM user_notifications
      WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);

    return NextResponse.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(unreadCountResult.rows[0]?.count || '0')
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in notifications POST API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { type, title, message, metadata } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    // Create new notification
    const result = await query(`
      INSERT INTO user_notifications (user_id, type, title, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, type, title, message, metadata ? JSON.stringify(metadata) : null]);

    return NextResponse.json({
      success: true,
      notification: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in notifications PUT API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { notificationIds, markAsRead } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Missing required field: notificationIds (array)' },
        { status: 400 }
      );
    }

    // Mark notifications as read/unread
    const result = await query(`
      UPDATE user_notifications
      SET is_read = $1
      WHERE id = ANY($2) AND user_id = $3
      RETURNING id
    `, [markAsRead, notificationIds, userId]);

    return NextResponse.json({
      success: true,
      updatedCount: result.rows.length
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 