import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureQuery } from '@/utils/secure-database';
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);
    const bookId = parseInt(params.bookId);
    const filePath = params.path.join('/');

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Check book access
    const bookResult = await secureQuery(`
      SELECT b.id, bf.extraction_path, bf.preserve_structure
      FROM books b
      LEFT JOIN book_files bf ON b.id = bf.book_id AND bf.file_type = 'ebook'
      WHERE b.id = $1 AND bf.preserve_structure = true
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found or not structure-preserved' }, { status: 404 });
    }

    const book = bookResult.rows[0];
    
    // Verify user access
    if (session?.user?.id) {
      const accessResult = await secureQuery(`
        SELECT 1 FROM (
          SELECT 1 FROM books WHERE id = $1 AND (created_by = $2 OR price = 0 OR visibility = 'public')
          UNION
          SELECT 1 FROM user_library WHERE user_id = $2 AND book_id = $1
        ) AS access_check LIMIT 1
      `, [bookId, session.user.id]);

      if (accessResult.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Serve file from extracted EPUB
    const storagePath = process.env.NODE_ENV === 'production' 
      ? '/app/storage/books'
      : path.join(process.cwd(), 'storage', 'books');
    
    const fullPath = path.join(storagePath, bookId.toString(), 'extracted', filePath);
    
    try {
      const fileContent = await fs.readFile(fullPath);
      const mimeType = mime.getType(fullPath) || 'application/octet-stream';
      
      return new NextResponse(fileContent as BodyInit, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('EPUB file serving error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}