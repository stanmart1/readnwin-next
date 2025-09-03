import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Try multiple possible locations for profile images
    const possiblePaths = [
      join(process.cwd(), 'storage', 'assets', 'profiles', filename),
      join(process.cwd(), 'public', 'images', 'uploads', filename),
      join(process.cwd(), 'uploads', 'profiles', filename)
    ];

    for (const imagePath of possiblePaths) {
      try {
        const imageBuffer = await readFile(imagePath);
        const ext = filename.split('.').pop()?.toLowerCase();
        
        let contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'webp') contentType = 'image/webp';

        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000'
          }
        });
      } catch (error) {
        continue; // Try next path
      }
    }

    // Return placeholder if image not found
    return NextResponse.redirect(new URL('/images/placeholder.svg', request.url));

  } catch (error) {
    console.error('Error serving profile image:', error);
    return NextResponse.redirect(new URL('/images/placeholder.svg', request.url));
  }
}