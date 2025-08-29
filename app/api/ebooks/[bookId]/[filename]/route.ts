import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; filename: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { bookId, filename } = params;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    
    // Check if user has access to this book
    const accessResult = await query(`
      SELECT b.id, b.title, bf.file_path, bf.mime_type
      FROM books b
      JOIN book_files bf ON b.id = bf.book_id
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      LEFT JOIN orders o ON b.id = ANY(o.book_ids) AND o.user_id = $1 AND o.status = 'completed'
      WHERE b.id = $2 AND bf.file_type = 'ebook' AND bf.stored_filename = $3
      AND (ul.id IS NOT NULL OR o.id IS NOT NULL OR $4 = ANY(SELECT unnest(string_to_array($5, ','))::int))
    `, [session.user.id, bookId, sanitizedFilename, session.user.id, process.env.ADMIN_USER_IDS || '']);

    if (accessResult.rows.length === 0) {
      return new NextResponse('Access denied', { status: 403 });
    }

    const bookFile = accessResult.rows[0];
    
    // Determine file path based on environment
    const filePath = process.env.NODE_ENV === 'production'
      ? join('/app/storage/books', bookId, sanitizedFilename)
      : join(process.cwd(), 'storage', 'books', bookId, sanitizedFilename);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const fileBuffer = readFileSync(filePath);
    const contentType = bookFile.mime_type || getContentType(sanitizedFilename);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`
      }
    });
    
  } catch (error) {
    console.error('Error serving ebook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'epub':
      return 'application/epub+zip';
    case 'html':
    case 'htm':
      return 'text/html';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}