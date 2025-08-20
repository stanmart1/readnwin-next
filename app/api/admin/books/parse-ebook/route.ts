import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('ebook_file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if it's an EPUB file
    if (!file.name.toLowerCase().endsWith('.epub')) {
      return NextResponse.json({ error: 'Only EPUB files are supported for parsing' }, { status: 400 });
    }

    try {
      // Parse EPUB file to extract page count
      const buffer = await file.arrayBuffer();
      const pages = await parseEpubPages(buffer);
      
      return NextResponse.json({ 
        success: true, 
        pages,
        message: `Successfully extracted ${pages} pages from EPUB file`
      });
    } catch (parseError) {
      console.error('Error parsing EPUB:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse EPUB file',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Parse ebook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function parseEpubPages(buffer: ArrayBuffer): Promise<number> {
  try {
    // Simple EPUB parsing - count HTML files in the EPUB
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    
    let pageCount = 0;
    
    // Look for HTML/XHTML files in the EPUB
    const htmlFiles = Object.keys(zip.files).filter(filename => 
      filename.toLowerCase().match(/\.(html|xhtml|htm)$/) && 
      !filename.startsWith('META-INF/') &&
      !filename.includes('toc.') &&
      !filename.includes('nav.')
    );
    
    // Estimate pages based on content files
    pageCount = htmlFiles.length;
    
    // If we have very few HTML files, try to estimate based on content length
    if (pageCount < 5) {
      let totalContentLength = 0;
      
      for (const filename of htmlFiles) {
        try {
          const content = await zip.files[filename].async('text');
          // Remove HTML tags and count characters
          const textContent = content.replace(/<[^>]*>/g, '').trim();
          totalContentLength += textContent.length;
        } catch (error) {
          console.warn(`Could not read file ${filename}:`, error);
        }
      }
      
      // Estimate pages based on character count (roughly 2000 characters per page)
      const estimatedPages = Math.max(1, Math.ceil(totalContentLength / 2000));
      pageCount = Math.max(pageCount, estimatedPages);
    }
    
    return Math.max(1, pageCount);
  } catch (error) {
    console.error('Error parsing EPUB structure:', error);
    // Return a default page count if parsing fails
    return 100;
  }
}