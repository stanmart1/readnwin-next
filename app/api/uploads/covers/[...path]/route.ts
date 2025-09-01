import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    
    // Try different possible locations for the image
    const possiblePaths = [
      join(process.cwd(), 'public', 'uploads', 'covers', imagePath),
      join(process.cwd(), 'storage', 'covers', imagePath),
      join(process.cwd(), 'storage', 'covers', 'original', imagePath),
      join(process.cwd(), 'uploads', 'covers', imagePath)
    ];

    for (const filePath of possiblePaths) {
      if (existsSync(filePath)) {
        try {
          const fileBuffer = await readFile(filePath);
          const ext = imagePath.split('.').pop()?.toLowerCase();
          
          let contentType = 'image/jpeg';
          if (ext === 'png') contentType = 'image/png';
          else if (ext === 'gif') contentType = 'image/gif';
          else if (ext === 'webp') contentType = 'image/webp';

          return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
          continue;
        }
      }
    }

    // If no image found, return placeholder
    try {
      const placeholderPath = join(process.cwd(), 'public', 'placeholder-book.jpg');
      if (existsSync(placeholderPath)) {
        const placeholderBuffer = await readFile(placeholderPath);
        return new NextResponse(new Uint8Array(placeholderBuffer), {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch (error) {
      console.error('Error reading placeholder image:', error);
    }

    // Final fallback - return 404
    return new NextResponse('Image not found', { status: 404 });

  } catch (error) {
    console.error('Error in image proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}