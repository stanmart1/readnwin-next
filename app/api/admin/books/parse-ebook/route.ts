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

    const fileName = file.name.toLowerCase();
    const isEpub = fileName.endsWith('.epub');
    const isHtml = fileName.endsWith('.html') || fileName.endsWith('.htm');
    
    if (!isEpub && !isHtml) {
      return NextResponse.json({ error: 'Only EPUB and HTML files are supported' }, { status: 400 });
    }

    try {
      let pages = 0;
      
      if (isEpub) {
        const buffer = await file.arrayBuffer();
        pages = await parseEpubPages(buffer);
      } else if (isHtml) {
        const text = await file.text();
        pages = await parseHtmlPages(text);
      }
      
      return NextResponse.json({ 
        success: true, 
        pages,
        format: isEpub ? 'epub' : 'html',
        message: `Successfully extracted ${pages} pages from ${isEpub ? 'EPUB' : 'HTML'} file`
      });
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      return NextResponse.json({ 
        error: `Failed to parse ${isEpub ? 'EPUB' : 'HTML'} file`,
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
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    
    const htmlFiles = Object.keys(zip.files).filter(filename => 
      filename.toLowerCase().match(/\.(html|xhtml|htm)$/) && 
      !filename.startsWith('META-INF/') &&
      !filename.includes('toc.') &&
      !filename.includes('nav.')
    );
    
    let totalContentLength = 0;
    for (const filename of htmlFiles) {
      try {
        const content = await zip.files[filename].async('text');
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        totalContentLength += textContent.length;
      } catch (error) {
        console.warn(`Could not read file ${filename}:`, error);
      }
    }
    
    const estimatedPages = Math.max(1, Math.ceil(totalContentLength / 2000));
    return Math.max(htmlFiles.length, estimatedPages);
  } catch (error) {
    console.error('Error parsing EPUB:', error);
    return 100;
  }
}

async function parseHtmlPages(htmlContent: string): Promise<number> {
  try {
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 250)); // 250 words per page
    return estimatedPages;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return 50;
  }
}