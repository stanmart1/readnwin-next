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
      whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`ul.access_type = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (user_id) {
      whereConditions.push(`ul.user_id = $${paramIndex}`);
      queryParams.push(user_id);
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
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), u.email) as user_name,
        u.email as user_email,
        ul.book_id,
        b.title as book_title,
        COALESCE(a.name, 'Unknown Author') as book_author,
        ul.acquired_at as assigned_at,
        COALESCE(ul.reading_progress, 0) as progress,
        ul.last_read_at as last_read,
        COALESCE(ul.access_type, 'purchased') as status
      FROM user_library ul
      JOIN users u ON ul.user_id = u.id
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      ${whereClause}
      ORDER BY ul.acquired_at DESC
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

    const { user_id, book_id, format } = await request.json();

    if (!user_id || !book_id) {
      return NextResponse.json({ error: 'User ID and Book ID are required' }, { status: 400 });
    }

    // Check if assignment already exists for this format
    const formatCondition = format ? 'AND format = $3' : '';
    const existingQuery = `
      SELECT id, format FROM user_library 
      WHERE user_id = $1 AND book_id = $2 ${formatCondition}
    `;
    const queryParams = format ? [user_id, book_id, format] : [user_id, book_id];
    const existingResult = await query(existingQuery, queryParams);

    if (existingResult.rows.length > 0) {
      const existingFormat = existingResult.rows[0].format || 'unknown';
      return NextResponse.json({ 
        error: `${format || existingFormat} format already assigned to this user` 
      }, { status: 400 });
    }

    // Get book details to determine type
    const bookQuery = `SELECT title, format FROM books WHERE id = $1`;
    const bookResult = await query(bookQuery, [book_id]);
    
    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    const book = bookResult.rows[0];

    // Create new assignment with format specification
    const assignedFormat = format || book.format;
    const insertQuery = `
      INSERT INTO user_library (user_id, book_id, purchase_date, access_type, format)
      VALUES ($1, $2, CURRENT_TIMESTAMP, 'assigned', $3)
      RETURNING id
    `;
    const result = await query(insertQuery, [user_id, book_id, assignedFormat]);

    const bookType = assignedFormat === 'physical' ? 'Physical book' : 'Ebook';
    return NextResponse.json({ 
      message: `${bookType} "${book.title}" assigned successfully`,
      id: result.rows[0].id,
      book_type: assignedFormat,
      format: assignedFormat
    });

  } catch (error) {
    console.error('Error assigning book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}