import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
      whereConditions.push(`(u.name ILIKE $${paramIndex} OR u.firstName ILIKE $${paramIndex} OR u.lastName ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`);
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
      FROM user_library ul
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
        COALESCE(u.name, CONCAT(u.firstName, ' ', u.lastName), u.email) as user_name,
        u.email as user_email,
        ul.book_id,
        b.title as book_title,
        COALESCE(a.name, 'Unknown Author') as book_author,
        ul.added_at as assigned_at,
        COALESCE(rp.progress_percentage, 0) as progress,
        rp.last_read_at as last_read,
        COALESCE(ul.status, 'active') as status
      FROM user_library ul
      JOIN users u ON ul.user_id = u.id
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
      ${whereClause}
      ORDER BY ul.added_at DESC
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
      SELECT id FROM user_library 
      WHERE user_id = $1 AND book_id = $2
    `;
    const existingResult = await query(existingQuery, [user_id, book_id]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'Book already assigned to this user' }, { status: 400 });
    }

    // Create new assignment
    const insertQuery = `
      INSERT INTO user_library (user_id, book_id, added_at, status)
      VALUES ($1, $2, NOW(), 'active')
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