import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId } = params;
    
    // Verify user has access to this book
    const bookCheck = await query(`
      SELECT b.id, b.title, b.ebook_file_url, b.format, ul.user_id as library_user,
             COALESCE(a.name, 'Unknown Author') as author_name
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE b.id = $2 AND (ul.user_id IS NOT NULL OR $3 IN ('admin', 'super_admin'))
    `, [parseInt(session.user.id), parseInt(bookId), session.user.role]);

    if (bookCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const book = bookCheck.rows[0];
    
    if (!book.ebook_file_url) {
      return NextResponse.json({ error: 'No e-book file available' }, { status: 404 });
    }

    // Extract filename from URL (e.g., /api/ebooks/123/123_filename.epub -> 123_filename.epub)
    const urlParts = book.ebook_file_url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Read the original e-book file (filename already includes bookId prefix)
    const filePath = join(process.cwd(), 'storage', 'ebooks', filename);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'E-book file not found' }, { status: 404 });
    }

    const fileBuffer = readFileSync(filePath);
    const fileContent = fileBuffer.toString('utf-8');
    
    // Determine content type and extract basic metadata
    let contentType = 'html';
    let content = fileContent;
    let wordCount = 0;
    
    if (filename.toLowerCase().endsWith('.epub')) {
      contentType = 'epub';
      // For EPUB, return structure info for the e-reader to handle
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(fileBuffer);
        
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
                title: book.title,
                author: book.author_name,
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
        title: titleMatch?.[1] || book.title,
        author: book.author_name,
        contentType: 'html',
        preservedFormat: false,
        content: content,
        wordCount: wordCount,
        chapters: [{
          id: 'chapter-1',
          title: book.title,
          order: 1
        }]
      });
    }

    // Default response for unsupported formats
    return NextResponse.json({
      title: book.title,
      author: book.author_name,
      contentType: contentType,
      preservedFormat: false,
      content: content,
      wordCount: wordCount
    });

  } catch (error) {
    console.error('Error serving book content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}