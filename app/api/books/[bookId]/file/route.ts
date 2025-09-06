import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureQuery } from '@/utils/secure-database';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Verify user authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has access to this book
    const accessResult = await secureQuery(`
      SELECT b.id, b.ebook_file_url, b.title
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $2
      WHERE b.id = $1 
      AND (
        ul.user_id IS NOT NULL 
        OR b.price = 0 
        OR EXISTS(SELECT 1 FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE oi.book_id = b.id AND o.user_id = $2 AND o.status = 'completed')
      )
    `, [bookId, session.user.id]);

    if (accessResult.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const book = accessResult.rows[0];
    
    if (!book.ebook_file_url) {
      return NextResponse.json({ error: 'No ebook file available' }, { status: 404 });
    }

    // Construct file path from storage
    const storageDir = join(process.cwd(), 'storage', 'books', bookId.toString());
    const fileName = book.ebook_file_url.split('/').pop();
    const filePath = join(storageDir, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read and serve the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    const extension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'epub':
        contentType = 'application/epub+zip';
        break;
      case 'html':
      case 'htm':
        contentType = 'text/html';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${book.title}.${extension}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Error serving ebook file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}