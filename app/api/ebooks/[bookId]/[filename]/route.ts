import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { query } from '@/utils/database';
import { SecurityUtils } from '@/utils/security-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; filename: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, filename } = params;
    
    // Verify user has access to this book (owns it or is admin)
    const bookCheck = await query(`
      SELECT b.id, b.ebook_file_url, ul.user_id as library_user
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      WHERE b.id = $2 AND (ul.user_id IS NOT NULL OR $3 IN ('admin', 'super_admin'))
    `, [parseInt(session.user.id), parseInt(bookId), session.user.role]);

    if (bookCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Serve the original e-book file with safe path
    const safeFilename = SecurityUtils.sanitizeFilename(filename);
    const storageDir = join(process.cwd(), 'storage', 'ebooks');
    const filePath = join(storageDir, safeFilename);
    
    if (!SecurityUtils.isPathSafe(filePath, storageDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = readFileSync(filePath);
    const fileExtension = filename.toLowerCase().split('.').pop();
    
    let contentType = 'application/octet-stream';
    if (fileExtension === 'epub') {
      contentType = 'application/epub+zip';
    } else if (fileExtension === 'html' || fileExtension === 'htm') {
      contentType = 'text/html';
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error serving e-book file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}