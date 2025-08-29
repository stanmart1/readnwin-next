import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    // Get admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if notifications table exists
    try {
      await query('SELECT 1 FROM user_notifications LIMIT 1');
    } catch (tableError) {
      // Return empty notifications if table doesn't exist
      return NextResponse.json({
        success: true,
        notifications: [],
        total: 0,
        pages: 0
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Cap at 100
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Build optimized WHERE clause
    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    if (isRead !== null && isRead !== undefined && isRead !== '') {
      whereClause += ` AND is_read = $${paramIndex++}`;
      params.push(isRead === 'true');
    }

    if (userId) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(parseInt(userId));
    }

    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex++} OR message ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Fast count query
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM user_notifications
      ${whereClause}
    `, params);

    // Fast notifications query - only essential fields
    const notificationsResult = await query(`
      SELECT 
        id, user_id, type, title, message, is_read, created_at
      FROM user_notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      notifications: notificationsResult.rows,
      total,
      pages
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
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, title, message, metadata, sendToAll } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    if (!sendToAll && !userId) {
      return NextResponse.json(
        { error: 'Either userId or sendToAll must be provided' },
        { status: 400 }
      );
    }

    let result;
    if (sendToAll) {
      // Get active users and create notifications in batch
      const usersResult = await query('SELECT id FROM users WHERE status = $1', ['active']);
      const userIds = usersResult.rows.map(u => u.id);
      
      if (userIds.length > 0) {
        const values = userIds.map((uid, i) => 
          `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
        ).join(',');
        
        const params = userIds.flatMap(uid => [uid, type, title, message]);
        
        await query(`
          INSERT INTO user_notifications (user_id, type, title, message)
          VALUES ${values}
        `, params);
        
        result = { notifications_created: userIds.length };
      }
    } else {
      const notificationResult = await query(`
        INSERT INTO user_notifications (user_id, type, title, message, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, type, title, message, metadata ? JSON.stringify(metadata) : null]);
      
      result = notificationResult.rows[0];
    }

    return NextResponse.json({
      success: true,
      notification: result
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, isRead, title, message } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing required field: notificationId' },
        { status: 400 }
      );
    }

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (isRead !== undefined) {
      updateFields.push(`is_read = $${paramIndex++}`);
      params.push(isRead);
    }

    if (title) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(title);
    }

    if (message) {
      updateFields.push(`message = $${paramIndex++}`);
      params.push(message);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(notificationId);

    const result = await query(`
      UPDATE user_notifications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    return NextResponse.json({
      success: true,
      notification: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM user_notifications WHERE id = $1',
      [parseInt(notificationId)]
    );

    const success = (result.rowCount || 0) > 0;

    return NextResponse.json({
      success,
      message: success ? 'Notification deleted successfully' : 'Notification not found'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 