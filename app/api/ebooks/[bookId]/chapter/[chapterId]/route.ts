import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, chapterId } = params;
    
    // Verify user has access to this book
    const bookCheck = await query(`
      SELECT b.id FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      WHERE b.id = $2 AND ul.user_id IS NOT NULL
    `, [parseInt(session.user.id), parseInt(bookId)]);

    if (bookCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find EPUB file
    const storageDir = join(process.cwd(), 'storage');
    let filePath = null;
    
    // Check storage/books/{bookId}/ (new structure)
    const bookDir = join(storageDir, 'books', bookId);
    if (existsSync(bookDir)) {
      const files = readdirSync(bookDir);
      const epubFile = files.find(f => f.endsWith('.epub'));
      if (epubFile) {
        filePath = join(bookDir, epubFile);
      }
    }
    
    // Check storage/ebooks/ (legacy)
    if (!filePath) {
      const ebooksDir = join(storageDir, 'ebooks');
      if (existsSync(ebooksDir)) {
        const files = readdirSync(ebooksDir);
        const epubFile = files.find(f => f.includes(bookId) && f.endsWith('.epub'));
        if (epubFile) {
          filePath = join(ebooksDir, epubFile);
        }
      }
    }
    
    if (!filePath || !existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Load EPUB and extract chapter
    const JSZip = (await import('jszip')).default;
    const fileBuffer = readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    
    // Find the chapter file
    const chapterFile = zip.file(chapterId);
    if (!chapterFile) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    const chapterContent = await chapterFile.async('text');
    
    return NextResponse.json({
      content: chapterContent
    });

  } catch (error) {
    console.error('Error serving chapter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}