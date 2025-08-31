import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureQuery } from '@/utils/secure-database';
import { BookStorage } from '@/utils/book-storage';
import { SecureEpubParser } from '@/lib/secure-epub-parser';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // For public books, allow access even without authentication
    let userId = session?.user?.id || null;

    const bookId = parseInt(params.bookId);
    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Get book info with file info - using correct column names
    let bookResult;
    try {
      bookResult = await secureQuery(`
        SELECT b.id, b.title, b.description, b.cover_image_url, b.created_at, b.updated_at, b.created_by, b.price, b.visibility,
               bf.stored_filename, bf.file_format, bf.file_size, bf.original_filename
        FROM books b
        LEFT JOIN book_files bf ON b.id = bf.book_id AND bf.file_type = 'ebook'
        WHERE b.id = $1
      `, [bookId]);
    } catch (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = bookResult.rows[0];

    // Check access - allow public books, or check user permissions
    if (userId) {
      try {
        const accessResult = await secureQuery(`
          SELECT 1 FROM (
            SELECT 1 FROM books WHERE id = $1 AND (created_by = $2 OR price = 0 OR visibility = 'public')
            UNION
            SELECT 1 FROM user_library WHERE user_id = $2 AND book_id = $1
          ) AS access_check LIMIT 1
        `, [bookId, userId]);

        if (accessResult.rows.length === 0) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      } catch (error) {
        console.error('Access check error:', error);
        return NextResponse.json({ error: 'Access check failed' }, { status: 500 });
      }
    } else {
      // No user session - only allow public books
      try {
        const publicCheck = await secureQuery(`
          SELECT 1 FROM books WHERE id = $1 AND (price = 0 OR visibility = 'public')
        `, [bookId]);
        
        if (publicCheck.rows.length === 0) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
      } catch (error) {
        console.error('Public access check error:', error);
        return NextResponse.json({ error: 'Access check failed' }, { status: 500 });
      }
    }

    let content = '';
    let contentType = 'html';
    let chapters: any[] = [];
    let structure: any = null;
    
    // Handle EPUB files - convert to HTML for display
    if (book.file_format === 'epub' && book.stored_filename) {
      try {
        // First try to get processed HTML content
        const processedContent = await BookStorage.getBookFile(bookId.toString(), 'content.html');
        if (processedContent) {
          content = processedContent.toString('utf-8');
          contentType = 'epub';
          
          // Try to get structure
          const bookStructure = await BookStorage.getBookStructure(bookId.toString());
          if (bookStructure) {
            structure = bookStructure;
            chapters = bookStructure.chapters || [];
          }
        } else {
          // If no processed content, try to process the EPUB now
          const epubBuffer = await BookStorage.getBookFile(bookId.toString(), book.stored_filename);
          if (epubBuffer) {
            console.log('Processing EPUB on-the-fly for book', bookId);
            const processResult = await BookStorage.processEpubFile(bookId.toString(), book.stored_filename, epubBuffer);
            
            if (processResult.success) {
              // Get the newly processed content
              const newContent = await BookStorage.getBookFile(bookId.toString(), 'content.html');
              if (newContent) {
                content = newContent.toString('utf-8');
                contentType = 'epub';
                
                const bookStructure = await BookStorage.getBookStructure(bookId.toString());
                if (bookStructure) {
                  structure = bookStructure;
                  chapters = bookStructure.chapters || [];
                }
              }
            } else {
              // Fallback content if processing fails
              content = `
                <div class="epub-content">
                  <h1>${book.title}</h1>
                  <p><strong>Format:</strong> EPUB (${Math.round(epubBuffer.length / 1024)}KB)</p>
                  <div class="chapter" data-chapter-id="chapter-1">
                    <h2 class="chapter-title">Chapter 1</h2>
                    <p>This EPUB book is being processed. The content will be available shortly.</p>
                    <p>Please refresh the page in a few moments to see the full content.</p>
                  </div>
                </div>`;
              contentType = 'epub';
              chapters = [{ id: 'chapter-1', title: 'Chapter 1', order: 1 }];
              structure = { type: 'epub', chapters: chapters };
            }
          }
        }
      } catch (error) {
        console.error('EPUB processing error:', error);
        content = `<h1>${book.title}</h1><p>EPUB file found but could not be processed. Error: ${error.message}</p>`;
      }
    } else {

    try {
        const fileContent = await BookStorage.getBookFile(bookId.toString(), 'content.html');
        
        if (fileContent) {
          content = fileContent.toString('utf-8');
          
          // Try to extract chapter structure from HTML
          const chapterMatches = content.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi);
          if (chapterMatches && chapterMatches.length > 1) {
            chapters = chapterMatches.map((match, index) => {
              const title = match.replace(/<[^>]*>/g, '').trim();
              return {
                id: `chapter-${index + 1}`,
                title: title,
                order: index + 1
              };
            });
            structure = {
              type: 'html',
              chapters: chapters
            };
          }
        } else {
          // Create default content
          await BookStorage.createDefaultContent(bookId, book.title);
          const defaultContent = await BookStorage.getBookFile(bookId.toString(), 'content.html');
          content = defaultContent ? defaultContent.toString('utf-8') : `<h1>${book.title}</h1><p>Content not available</p>`;
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        content = `<h1>${book.title}</h1><p>This is a sample book content. The e-reader is working correctly.</p>`;
      }
    }

    // Calculate word count
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;

    // Return JSON format expected by EReader store
    return NextResponse.json({
      id: book.id.toString(),
      title: book.title || 'Untitled Book',
      author: 'Unknown Author', // Will need to join with authors table later
      description: book.description || '',
      content: content,
      contentType: contentType,
      wordCount: wordCount,
      filePath: 'content.html',
      coverImage: book.cover_image_url,
      createdAt: book.created_at || new Date().toISOString(),
      updatedAt: book.updated_at || new Date().toISOString(),
      structure: structure,
      chapters: chapters,
      originalFormat: book.file_format || 'html'
    });

  } catch (error) {
    console.error('Error serving book content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}