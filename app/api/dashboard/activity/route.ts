import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in activity API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const activityType = searchParams.get('type');

    let activityQuery = `
      SELECT 
        ua.id,
        ua.activity_type,
        ua.title,
        ua.description,
        ua.book_id,
        b.title as book_title,
        b.cover_image_url,
        ua.metadata,
        ua.created_at
      FROM user_activity ua
      LEFT JOIN books b ON ua.book_id = b.id
      WHERE ua.user_id = $1
    `;
    const queryParams = [userId];

    if (activityType) {
      activityQuery += ` AND ua.activity_type = $${queryParams.length + 1}`;
      queryParams.push(activityType);
    }

    activityQuery += ` ORDER BY ua.created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit.toString());

    const result = await query(activityQuery, queryParams);

    const activities = result.rows.map(row => ({
      id: row.id,
      activity_type: row.activity_type,
      title: row.title,
      description: row.description,
      book_id: row.book_id,
      book_title: row.book_title,
      cover_image_url: row.cover_image_url,
      metadata: row.metadata,
      created_at: row.created_at
    }));

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
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
      console.log('❌ No session or user ID found in activity POST API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { activity_type, title, description, book_id, metadata } = body;

    if (!activity_type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: activity_type, title' },
        { status: 400 }
      );
    }

    // Create activity record
    const result = await query(`
      INSERT INTO user_activity (user_id, activity_type, title, description, book_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, activity_type, title, description || null, book_id ? parseInt(book_id) : null, metadata ? JSON.stringify(metadata) : null]);

    return NextResponse.json({
      success: true,
      activity: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating user activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 