import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import * as JSZip from 'jszip';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = params.bookId;
    const { fileUrl } = await request.json();

    // Check if user has access to this book
    const accessCheck = await query(`
      SELECT b.id, b.title, b.ebook_file_url, b.format, a.name as author_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      WHERE b.id = $2
    `, [userId, bookId]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const book = accessCheck.rows[0];
    
    // Check if user has access to this book
    if (!book.ebook_file_url) {
      return NextResponse.json(
        { error: 'Access denied. Book not in your library.' },
        { status: 403 }
      );
    }

    // Determine the file path using new storage structure
    let filePath: string;
    
    if (fileUrl) {
      // Use the provided file URL
      if (fileUrl.startsWith('/uploads/')) {
        // New storage structure: /uploads/books/[bookId]/[filename]
        const mediaRootDir = process.env.NODE_ENV === 'production' 
          ? '/uploads' 
          : join(process.cwd(), 'uploads');
        const relativePath = fileUrl.replace('/uploads/', '');
        filePath = join(mediaRootDir, relativePath);
      } else if (fileUrl.startsWith('/uploads/')) {
        // Legacy storage structure: /uploads/books/[bookId]/[filename]
        const mediaRootDir = process.env.NODE_ENV === 'production' 
          ? '/uploads' 
          : join(process.cwd(), 'uploads');
        const relativePath = fileUrl.replace('/uploads/', '');
        filePath = join(mediaRootDir, relativePath);
      } else if (fileUrl.startsWith('/book-files/')) {
        // Legacy support for old structure
        const bookFilesDir = process.env.NODE_ENV === 'production' 
          ? '/uploads/books' 
          : join(process.cwd(), 'book-files');
        const relativePath = fileUrl.replace('/book-files/', '');
        filePath = join(bookFilesDir, relativePath);
      } else {
        filePath = fileUrl;
      }
    } else {
      // Use the book's stored file URL
      if (book.ebook_file_url.startsWith('/uploads/')) {
        // New storage structure
        const mediaRootDir = process.env.NODE_ENV === 'production' 
          ? '/uploads' 
          : join(process.cwd(), 'uploads');
        const relativePath = book.ebook_file_url.replace('/uploads/', '');
        filePath = join(mediaRootDir, relativePath);
      } else if (book.ebook_file_url.startsWith('/uploads/')) {
        // Legacy storage structure
        const mediaRootDir = process.env.NODE_ENV === 'production' 
          ? '/uploads' 
          : join(process.cwd(), 'uploads');
        const relativePath = book.ebook_file_url.replace('/uploads/', '');
        filePath = join(mediaRootDir, relativePath);
      } else if (book.ebook_file_url.startsWith('/book-files/')) {
        // Legacy support
        const bookFilesDir = process.env.NODE_ENV === 'production' 
          ? '/uploads/books' 
          : join(process.cwd(), 'book-files');
        const relativePath = book.ebook_file_url.replace('/book-files/', '');
        filePath = join(bookFilesDir, relativePath);
      } else {
        filePath = book.ebook_file_url;
      }
    }

    console.log('🔍 EPUB API: File path resolution:', {
      originalUrl: fileUrl || book.ebook_file_url,
      resolvedPath: filePath,
      exists: existsSync(filePath)
    });

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'EPUB file not found' },
        { status: 404 }
      );
    }

    // Parse the EPUB file
    const epubContent = await parseEPUB(filePath, book);

    console.log('🔍 EPUB API: Parsed content structure:', {
      hasTitle: !!epubContent.title,
      hasAuthor: !!epubContent.author,
      hasChapters: !!epubContent.chapters,
      chaptersLength: epubContent.chapters?.length || 0
    });

    return NextResponse.json({
      success: true,
      content: epubContent
    });

  } catch (error) {
    console.error('Error parsing EPUB:', error);
    return NextResponse.json(
      { error: 'Failed to parse EPUB file' },
      { status: 500 }
    );
  }
}

async function parseEPUB(filePath: string, book: any) {
  try {
    // Read the EPUB file
    const epubBuffer = await readFile(filePath);
    
    // Parse the ZIP file (EPUB is essentially a ZIP)
    const zip = new JSZip.default();
    const zipContent = await zip.loadAsync(epubBuffer);

    // Read the container.xml to find the OPF file
    const containerXml = await zipContent.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
      throw new Error('Invalid EPUB: Missing container.xml');
    }

    // Extract the OPF file path
    const opfMatch = containerXml.match(/full-path="([^"]+)"/);
    if (!opfMatch) {
      throw new Error('Invalid EPUB: Cannot find OPF file');
    }

    const opfPath = opfMatch[1];
    const opfContent = await zipContent.file(opfPath)?.async('string');
    if (!opfContent) {
      throw new Error('Invalid EPUB: Cannot read OPF file');
    }

    // Parse the OPF file to get metadata and spine
    const { metadata, spine, manifest } = parseOPF(opfContent);

    // Read the NCX file for table of contents (if available)
    let toc = [];
    if (metadata.toc) {
      const ncxContent = await zipContent.file(metadata.toc)?.async('string');
      if (ncxContent) {
        toc = parseNCX(ncxContent);
      }
    }

    // Read all content files
    const chapters = [];
    for (const itemId of spine) {
      const item = manifest[itemId];
      if (item && item.href) {
        const contentPath = resolvePath(opfPath, item.href);
        const content = await zipContent.file(contentPath)?.async('string');
        if (content) {
          // DISABLED: Content cleaning to preserve original EPUB structure
          // const cleanContent = cleanHTML(content);
          
          // Extract title from content if not provided
          let title = item.title;
          if (!title) {
            const titleMatch = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
            if (titleMatch) {
              title = titleMatch[1].trim();
            } else {
              title = `Chapter ${chapters.length + 1}`;
            }
          }
          
          chapters.push({
            id: itemId,
            title: title,
            content: content // Use original HTML content instead of cleaned content
          });
        }
      }
    }
    
    // If no chapters found, try to find any HTML content in the manifest
    if (chapters.length === 0) {
      console.log('No chapters found in spine, searching manifest for HTML content...');
      for (const [id, item] of Object.entries(manifest)) {
        const manifestItem = item as { href: string; mediaType: string };
        if (manifestItem.mediaType === 'application/xhtml+xml' || manifestItem.mediaType === 'text/html') {
          const contentPath = resolvePath(opfPath, manifestItem.href);
          const content = await zipContent.file(contentPath)?.async('string');
                  if (content) {
          // DISABLED: Content cleaning to preserve original EPUB structure
          // const cleanContent = cleanHTML(content);
          chapters.push({
            id: id,
            title: `Content ${chapters.length + 1}`,
            content: content // Use original HTML content instead of cleaned content
          });
          }
        }
      }
    }

    return {
      title: metadata.title || book.title,
      author: metadata.author || book.author_name || 'Unknown Author',
      chapters: chapters.length > 0 ? chapters : [{
        id: 'content',
        title: 'Content',
        content: '<p>No chapters found in this EPUB.</p>'
      }],
      currentChapter: 0
    };

  } catch (error) {
    console.error('Error parsing EPUB:', error);
    throw new Error(`Failed to parse EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseOPF(opfContent: string) {
  const metadata: any = {};
  const spine: string[] = [];
  const manifest: any = {};

  // Extract metadata with better regex patterns
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
  if (titleMatch) metadata.title = titleMatch[1].trim();

  const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);
  if (authorMatch) metadata.author = authorMatch[1].trim();

  const descriptionMatch = opfContent.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/);
  if (descriptionMatch) metadata.description = descriptionMatch[1].trim();

  const languageMatch = opfContent.match(/<dc:language[^>]*>([^<]+)<\/dc:language>/);
  if (languageMatch) metadata.language = languageMatch[1].trim();

  const identifierMatch = opfContent.match(/<dc:identifier[^>]*>([^<]+)<\/dc:identifier>/);
  if (identifierMatch) metadata.identifier = identifierMatch[1].trim();

  const publisherMatch = opfContent.match(/<dc:publisher[^>]*>([^<]+)<\/dc:publisher>/);
  if (publisherMatch) metadata.publisher = publisherMatch[1].trim();

  const dateMatch = opfContent.match(/<dc:date[^>]*>([^<]+)<\/dc:date>/);
  if (dateMatch) metadata.date = dateMatch[1].trim();

  // Extract manifest with more flexible regex
  const manifestMatch = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/);
  if (manifestMatch) {
    const manifestContent = manifestMatch[1];
    // More flexible regex to handle different attribute orders and optional attributes
    const itemMatches = manifestContent.matchAll(/<item[^>]*id\s*=\s*["']([^"']+)["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*media-type\s*=\s*["']([^"']+)["'][^>]*\/?>/gi);
    
    for (const match of itemMatches) {
      const [, id, href, mediaType] = match;
      if (mediaType === 'application/xhtml+xml' || mediaType === 'text/html') {
        manifest[id] = { href, mediaType };
      } else if (mediaType === 'application/x-dtbncx+xml') {
        metadata.toc = href;
      }
    }
  }

  // Extract spine with more flexible regex
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/);
  if (spineMatch) {
    const spineContent = spineMatch[1];
    const itemrefMatches = spineContent.matchAll(/<itemref[^>]*idref\s*=\s*["']([^"']+)["'][^>]*\/?>/gi);
    
    for (const match of itemrefMatches) {
      const [, idref] = match;
      spine.push(idref);
    }
  }

  return { metadata, spine, manifest };
}

function parseNCX(ncxContent: string) {
  const toc: any[] = [];
  
  const navPointMatches = ncxContent.matchAll(/<navPoint[^>]*>([\s\S]*?)<\/navPoint>/g);
  
  for (const match of navPointMatches) {
    const navPointContent = match[1];
    
    const textMatch = navPointContent.match(/<text>([^<]+)<\/text>/);
    const srcMatch = navPointContent.match(/<content[^>]*src="([^"]+)"[^>]*\/?>/);
    
    if (textMatch && srcMatch) {
      toc.push({
        title: textMatch[1],
        src: srcMatch[1]
      });
    }
  }
  
  return toc;
}

function resolvePath(basePath: string, relativePath: string): string {
  const baseDir = basePath.split('/').slice(0, -1).join('/');
  return baseDir ? `${baseDir}/${relativePath}` : relativePath;
}

function cleanHTML(html: string): string {
  // Extract only the text content, removing all HTML tags for clean reading
  return html
    // Remove all HTML tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '')
    .replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<canvas[^>]*>[\s\S]*?<\/canvas>/gi, '')
    
    // Convert headings to readable format
    .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>([^<]+)<\/h4>/gi, '\n\n#### $1\n\n')
    .replace(/<h5[^>]*>([^<]+)<\/h5>/gi, '\n\n##### $1\n\n')
    .replace(/<h6[^>]*>([^<]+)<\/h6>/gi, '\n\n###### $1\n\n')
    
    // Convert paragraphs to readable format
    .replace(/<p[^>]*>([^<]+)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<div[^>]*>([^<]+)<\/div>/gi, '\n\n$1\n\n')
    .replace(/<section[^>]*>([^<]+)<\/section>/gi, '\n\n$1\n\n')
    .replace(/<article[^>]*>([^<]+)<\/article>/gi, '\n\n$1\n\n')
    
    // Convert line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    
    // Clean up excessive whitespace and line breaks
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
} 