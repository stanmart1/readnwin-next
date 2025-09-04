import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SecurityUtils } from '@/utils/security-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, path } = params;
    const sanitizedPath = path.map(p => SecurityUtils.sanitizePath(p)).join('/');
    const filePath = sanitizedPath;
    
    // Verify user has access to this book
    const bookCheck = await query(`
      SELECT b.id, b.ebook_file_url, ul.user_id as library_user
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      WHERE b.id = $2 AND (ul.user_id IS NOT NULL OR $3 IN ('admin', 'super_admin'))
    `, [parseInt(session.user.id), parseInt(bookId), session.user.role]);

    if (bookCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const book = bookCheck.rows[0];
    if (!book.ebook_file_url) {
      return NextResponse.json({ error: 'No e-book file available' }, { status: 404 });
    }

    const urlParts = book.ebook_file_url.split('/');
    const rawFilename = urlParts[urlParts.length - 1]; // This already includes bookId prefix
    const filename = SecurityUtils.sanitizeFilename(rawFilename);
    const storageDir = join(process.cwd(), 'storage', 'ebooks');
    const ebookPath = join(storageDir, filename);
    
    if (!SecurityUtils.isPathSafe(ebookPath, storageDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    if (!existsSync(ebookPath) || !filename.toLowerCase().endsWith('.epub')) {
      return NextResponse.json({ error: 'EPUB file not found' }, { status: 404 });
    }

    try {
      const JSZip = (await import('jszip')).default;
      const fileBuffer = readFileSync(ebookPath);
      const zip = await JSZip.loadAsync(fileBuffer);
      
      const requestedFile = zip.file(filePath);
      if (!requestedFile) {
        return NextResponse.json({ error: 'File not found in EPUB' }, { status: 404 });
      }

      const content = await requestedFile.async('text');
      
      let contentType = 'text/plain';
      if (filePath.endsWith('.html') || filePath.endsWith('.xhtml')) {
        contentType = 'text/html';
      } else if (filePath.endsWith('.css')) {
        contentType = 'text/css';
      } else if (filePath.endsWith('.xml')) {
        contentType = 'application/xml';
      }

      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=3600'
        }
      });

    } catch (error) {
      console.error('Error extracting EPUB content:', error);
      return NextResponse.json({ error: 'Failed to extract EPUB content' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error serving extracted EPUB file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}