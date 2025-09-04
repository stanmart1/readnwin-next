import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SecurityUtils } from '@/utils/security-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    console.log('Book content request for bookId:', SecurityUtils.sanitizeForLog(params.bookId));
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId } = params;
    const bookIdNum = parseInt(bookId);
    
    if (isNaN(bookIdNum)) {
      console.log('Invalid bookId:', SecurityUtils.sanitizeForLog(bookId));
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }
    
    console.log('Checking book access for user:', SecurityUtils.sanitizeForLog(session.user.id), 'book:', SecurityUtils.sanitizeForLog(bookIdNum));
    
    // Verify user has access to this book
    const bookCheck = await query(`
      SELECT b.id, b.title, b.ebook_file_url, b.format, ul.user_id as library_user,
             COALESCE(a.name, 'Unknown Author') as author_name
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE b.id = $2 AND (ul.user_id IS NOT NULL OR $3 IN ('admin', 'super_admin'))
    `, [parseInt(session.user.id), bookIdNum, session.user.role]);

    console.log('Book check result:', bookCheck.rows.length, 'rows');

    if (bookCheck.rows.length === 0) {
      console.log('Access denied for book:', bookIdNum);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const book = bookCheck.rows[0];
    console.log('Book found:', SecurityUtils.sanitizeForLog(book.title), 'file_url:', SecurityUtils.sanitizeForLog(book.ebook_file_url));
    
    if (!book.ebook_file_url) {
      console.log('No ebook file URL for book:', bookIdNum);
      return NextResponse.json({ error: 'No e-book file available' }, { status: 404 });
    }

    // Extract filename from URL and determine correct file path
    const urlParts = book.ebook_file_url.split('/');
    const rawFilename = urlParts[urlParts.length - 1];
    const filename = SecurityUtils.sanitizeFilename(rawFilename);
    console.log('Extracted filename:', SecurityUtils.sanitizeForLog(filename));
    
    // Try multiple possible file locations with safe paths
    const storageDir = join(process.cwd(), 'storage');
    let possiblePaths = [
      join(storageDir, 'ebooks', filename),
      join(storageDir, 'ebooks', `${bookId}_${filename}`),
      join(storageDir, 'books', bookId, filename),
      join(storageDir, 'books', bookId, `${bookId}_${filename}`)
    ];
    
    // If filename contains book title, search for any file with that title
    try {
      const { readdirSync } = require('fs');
      const ebooksDir = join(storageDir, 'ebooks');
      if (existsSync(ebooksDir)) {
        const titlePart = filename.replace(/^\d+_/, '').toLowerCase();
        const matchingFiles = readdirSync(ebooksDir).filter(f => 
          f.toLowerCase().includes(titlePart) || f.includes(bookId)
        );
        possiblePaths.push(...matchingFiles.map(f => join(ebooksDir, f)));
      }
    } catch (searchError) {
      console.log('File search error:', SecurityUtils.sanitizeForLog(searchError));
    }
    
    possiblePaths = possiblePaths.filter(p => SecurityUtils.isPathSafe(p, storageDir));
    
    let filePath = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        filePath = path;
        break;
      }
    }
    
    console.log('Trying paths:', possiblePaths.map(p => SecurityUtils.sanitizeForLog(p)));
    console.log('Found file at:', SecurityUtils.sanitizeForLog(filePath));
    
    if (!filePath) {
      console.log('File not found in any of the expected locations');
      
      // Try to find any file that might match the book title
      try {
        const { readdirSync } = require('fs');
        const ebooksDir = join(process.cwd(), 'storage', 'ebooks');
        if (existsSync(ebooksDir)) {
          const availableFiles = readdirSync(ebooksDir);
          console.log('Available files:', availableFiles);
          
          // For Moby Dick specifically, try to find any moby file
          if (book.title.toLowerCase().includes('moby')) {
            const mobyFile = availableFiles.find(f => f.toLowerCase().includes('moby'));
            if (mobyFile) {
              const mobyPath = join(ebooksDir, mobyFile);
              if (SecurityUtils.isPathSafe(mobyPath, join(process.cwd(), 'storage'))) {
                console.log('Found fallback Moby Dick file:', SecurityUtils.sanitizeForLog(mobyFile));
                filePath = mobyPath;
              }
            }
          }
        }
      } catch (listError) {
        console.log('Could not list ebooks directory:', SecurityUtils.sanitizeForLog(listError));
      }
      
      if (!filePath) {
        return NextResponse.json({ 
          error: 'E-book file not found',
          details: `No file found for book ${bookId} with filename ${SecurityUtils.sanitizeForLog(filename)}`
        }, { status: 404 });
      }
    }

    console.log('Reading file buffer...');
    const fileBuffer = readFileSync(filePath);
    console.log('File buffer size:', fileBuffer.length);
    
    let fileContent;
    try {
      fileContent = fileBuffer.toString('utf-8');
      console.log('File content length:', fileContent.length);
    } catch (encodingError) {
      console.log('UTF-8 encoding failed, file might be binary');
      fileContent = null;
    }
    
    // Determine content type and extract basic metadata
    let contentType = 'html';
    let content = fileContent;
    let wordCount = 0;
    
    console.log('Processing file type for:', filename);
    
    if (filename.toLowerCase().endsWith('.epub')) {
      console.log('Processing EPUB file');
      contentType = 'epub';
      // For EPUB, return structure info for the e-reader to handle
      try {
        console.log('Loading JSZip...');
        const JSZip = (await import('jszip')).default;
        console.log('Parsing EPUB with JSZip...');
        const zip = await JSZip.loadAsync(fileBuffer);
        console.log('EPUB loaded successfully, files:', Object.keys(zip.files).length);
        
        // Extract basic structure
        const containerFile = zip.file('META-INF/container.xml');
        if (containerFile) {
          const containerXml = await containerFile.async('text');
          const opfMatch = containerXml.match(/full-path="([^"]+)"/i);
          
          if (opfMatch) {
            const opfFile = zip.file(opfMatch[1]);
            if (opfFile) {
              const opfXml = await opfFile.async('text');
              
              // Parse spine for chapter structure
              const spineMatches = opfXml.match(/<itemref[^>]*idref="([^"]+)"/gi);
              const spine = spineMatches?.map(match => {
                const idMatch = match.match(/idref="([^"]+)"/i);
                return idMatch ? idMatch[1] : null;
              }).filter(Boolean) || [];
              
              // Parse manifest for file references
              const manifestMatches = opfXml.match(/<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="([^"]+)"/gi);
              const manifest: Record<string, any> = {};
              
              manifestMatches?.forEach(match => {
                const idMatch = match.match(/id="([^"]+)"/i);
                const hrefMatch = match.match(/href="([^"]+)"/i);
                const typeMatch = match.match(/media-type="([^"]+)"/i);
                
                if (idMatch && hrefMatch && typeMatch) {
                  manifest[idMatch[1]] = {
                    href: hrefMatch[1],
                    mediaType: typeMatch[1]
                  };
                }
              });
              
              return NextResponse.json({
                title: SecurityUtils.sanitizeHtml(book.title),
                author: SecurityUtils.sanitizeHtml(book.author_name),
                contentType: 'epub',
                preservedFormat: true,
                structure: {
                  spine,
                  manifest,
                  opfPath: opfMatch[1]
                },
                // Provide the base URL for accessing individual files
                baseUrl: `/api/ebooks/${bookId}/`,
                wordCount: spine.length * 500 // Rough estimate
              });
            }
          }
        }
      } catch (epubError) {
        console.error('EPUB parsing error:', epubError);
        // Fall back to basic response
      }
    } else if (filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')) {
      // For HTML, extract basic info and return content
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      const words = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
      wordCount = words.length;
      
      return NextResponse.json({
        title: SecurityUtils.sanitizeHtml(titleMatch?.[1] || book.title),
        author: SecurityUtils.sanitizeHtml(book.author_name),
        contentType: 'html',
        preservedFormat: false,
        content: content,
        wordCount: wordCount,
        chapters: [{
          id: 'chapter-1',
          title: SecurityUtils.sanitizeHtml(book.title),
          order: 1
        }]
      });
    }

    // Default response for unsupported formats
    return NextResponse.json({
      title: SecurityUtils.sanitizeHtml(book.title),
      author: SecurityUtils.sanitizeHtml(book.author_name),
      contentType: contentType,
      preservedFormat: false,
      content: content,
      wordCount: wordCount
    });

  } catch (error) {
    console.error('Error serving book content:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}