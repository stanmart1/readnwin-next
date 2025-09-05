import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { SecurityUtils } from '@/utils/security-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all books with ebook files from database
    const booksResult = await query(`
      SELECT id, title, ebook_file_url, format
      FROM books 
      WHERE ebook_file_url IS NOT NULL 
      AND (format = 'ebook' OR format = 'hybrid')
      ORDER BY id
    `);

    const books = booksResult.rows;
    const storageDir = join(process.cwd(), 'storage', 'ebooks');
    
    // Check if storage directory exists
    if (!existsSync(storageDir)) {
      return NextResponse.json({
        error: 'Storage directory not found',
        path: storageDir
      }, { status: 404 });
    }

    // Get all files in storage directory
    const storageFiles = readdirSync(storageDir);
    
    const verification = {
      total_books: books.length,
      total_files: storageFiles.length,
      matched: [],
      missing_files: [],
      orphaned_files: [],
      mismatched: []
    };

    // Check each book's file
    for (const book of books) {
      const urlParts = book.ebook_file_url.split('/');
      const expectedFilename = urlParts[urlParts.length - 1];
      const safeFilename = SecurityUtils.sanitizeFilename(expectedFilename);
      const filePath = join(storageDir, safeFilename);
      
      if (existsSync(filePath)) {
        verification.matched.push({
          book_id: book.id,
          title: book.title,
          filename: safeFilename,
          status: 'found'
        });
      } else {
        // Try alternative naming patterns
        const alternativeNames = [
          `${book.id}_${safeFilename}`,
          safeFilename.replace(/^\d+_/, `${book.id}_`)
        ];
        
        let found = false;
        for (const altName of alternativeNames) {
          if (storageFiles.includes(altName)) {
            verification.mismatched.push({
              book_id: book.id,
              title: book.title,
              expected: safeFilename,
              actual: altName,
              status: 'name_mismatch'
            });
            found = true;
            break;
          }
        }
        
        if (!found) {
          verification.missing_files.push({
            book_id: book.id,
            title: book.title,
            expected_filename: safeFilename,
            status: 'missing'
          });
        }
      }
    }

    // Find orphaned files
    const expectedFilenames = books.map(book => {
      const urlParts = book.ebook_file_url.split('/');
      return SecurityUtils.sanitizeFilename(urlParts[urlParts.length - 1]);
    });

    for (const file of storageFiles) {
      if (!expectedFilenames.includes(file)) {
        // Check if it's an alternative naming pattern
        const bookIdMatch = file.match(/^(\d+)_/);
        if (bookIdMatch) {
          const bookId = parseInt(bookIdMatch[1]);
          const bookExists = books.some(b => b.id === bookId);
          if (!bookExists) {
            verification.orphaned_files.push({
              filename: file,
              status: 'orphaned',
              reason: 'no_matching_book'
            });
          }
        } else {
          verification.orphaned_files.push({
            filename: file,
            status: 'orphaned',
            reason: 'unknown_pattern'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      verification,
      summary: {
        healthy: verification.matched.length,
        issues: verification.missing_files.length + verification.orphaned_files.length + verification.mismatched.length,
        health_percentage: Math.round((verification.matched.length / verification.total_books) * 100)
      }
    });

  } catch (error) {
    console.error('File verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}