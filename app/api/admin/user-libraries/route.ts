import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const user_id = searchParams.get('user_id');

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`ul.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (user_id) {
      whereConditions.push(`ul.user_id = $${paramIndex}`);
      queryParams.push(parseInt(user_id));
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_libraries ul
      JOIN users u ON ul.user_id = u.id
      JOIN books b ON ul.book_id = b.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get libraries with pagination
    const librariesQuery = `
      SELECT 
        ul.id,
        ul.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        ul.book_id,
        b.title as book_title,
        b.author_name as book_author,
        ul.assigned_at,
        ul.progress,
        ul.last_read,
        ul.status
      FROM user_libraries ul
      JOIN users u ON ul.user_id = u.id
      JOIN books b ON ul.book_id = b.id
      ${whereClause}
      ORDER BY ul.assigned_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const librariesResult = await query(librariesQuery, queryParams);

    return NextResponse.json({
      libraries: librariesResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user libraries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, book_id } = await request.json();

    if (!user_id || !book_id) {
      return NextResponse.json({ error: 'User ID and Book ID are required' }, { status: 400 });
    }

    // Check if assignment already exists
    const existingQuery = `
      SELECT id FROM user_libraries 
      WHERE user_id = $1 AND book_id = $2
    `;
    const existingResult = await query(existingQuery, [user_id, book_id]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'Book already assigned to this user' }, { status: 400 });
    }

    // Create new assignment
    const insertQuery = `
      INSERT INTO user_libraries (user_id, book_id, assigned_at, progress, status)
      VALUES ($1, $2, NOW(), 0, 'active')
      RETURNING id
    `;
    const result = await query(insertQuery, [user_id, book_id]);

    return NextResponse.json({ 
      message: 'Book assigned successfully',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error assigning book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}