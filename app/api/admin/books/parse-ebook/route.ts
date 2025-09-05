import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let metadata = {
      title: '',
      author: '',
      pages: 0,
      wordCount: 0
    };

    if (file.name.toLowerCase().endsWith('.epub')) {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(buffer);
        
        const containerFile = zip.file('META-INF/container.xml');
        if (containerFile) {
          const containerXml = await containerFile.async('text');
          const opfMatch = containerXml.match(/full-path="([^"]+)"/i);
          
          if (opfMatch) {
            const opfFile = zip.file(opfMatch[1]);
            if (opfFile) {
              const opfXml = await opfFile.async('text');
              
              const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
              const creatorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
              
              if (titleMatch) metadata.title = titleMatch[1];
              if (creatorMatch) metadata.author = creatorMatch[1];
              
              const spineMatches = opfXml.match(/<itemref[^>]*idref="[^"]+"/gi);
              if (spineMatches) {
                metadata.pages = Math.max(spineMatches.length * 2, 10);
              }
            }
          }
        }
      } catch (error) {
        console.error('EPUB parsing error:', error);
      }
    } else if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
      const htmlContent = buffer.toString('utf-8');
      
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      const authorMatch = htmlContent.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
      
      if (titleMatch) metadata.title = titleMatch[1];
      if (authorMatch) metadata.author = authorMatch[1];
      
      const textContent = htmlContent.replace(/<[^>]*>/g, ' ');
      const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
      metadata.wordCount = words.length;
      metadata.pages = Math.ceil(words.length / 250);
    }

    return NextResponse.json({
      success: true,
      metadata
    });

  } catch (error) {
    console.error('Parse ebook error:', error);
    return NextResponse.json({ error: 'Failed to parse ebook' }, { status: 500 });
  }
}