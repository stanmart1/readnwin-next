import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Handle both array and string path formats
    const pathArray = Array.isArray(params.path) ? params.path : [params.path];
    console.log('📁 Uploads API called with path:', pathArray);
    // Construct the file path using the storage location
    let basePath;
    
    // Check if this is a cover image request
    const isCoverImage = pathArray[0] === 'covers';
    
    if (isCoverImage) {
      // Cover images are always in public/uploads/covers
      basePath = join(process.cwd(), 'public', 'uploads');
      console.log(`📁 Cover image: Using base path: ${basePath}`);
    } else if (process.env.NODE_ENV === 'production') {
      // In production, try multiple possible locations for other files
      const possiblePaths = [
        '/app/uploads',
        '/app/storage',
        join(process.cwd(), 'uploads'),
        join(process.cwd(), 'public', 'uploads')
      ];
      basePath = possiblePaths.find(path => existsSync(path)) || '/app/uploads';
      console.log(`📁 Production: Using base path: ${basePath}`);
    } else {
      basePath = join(process.cwd(), 'public', 'uploads');
      console.log(`📁 Development: Using base path: ${basePath}`);
    }
    
    const filePath = join(basePath, ...pathArray);
    
    // Check if file exists, try alternative paths if not found
    let finalFilePath = filePath;
    if (!existsSync(filePath)) {
      // Try alternative storage locations based on file type
      let alternativePaths: string[];
      
      if (isCoverImage) {
        // For cover images, only try public directory locations
        alternativePaths = [
          join(process.cwd(), 'public', 'uploads', ...pathArray),
          join('/app', 'public', 'uploads', ...pathArray)
        ];
      } else {
        // For other files, try various storage locations
        alternativePaths = [
          join(process.cwd(), 'public', 'uploads', ...pathArray),
          join(process.cwd(), 'uploads', ...pathArray),
          join(process.cwd(), 'storage', ...pathArray),
          join('/app', 'uploads', ...pathArray),
          join('/app', 'storage', ...pathArray)
        ];
      }
      
      finalFilePath = alternativePaths.find(path => existsSync(path)) || filePath;
      
      if (!existsSync(finalFilePath)) {
        console.log('❌ File not found at any location:', {
          requested: pathArray,
          isCoverImage,
          tried: [filePath, ...alternativePaths],
          cwd: process.cwd(),
          nodeEnv: process.env.NODE_ENV
        });
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      } else {
        console.log('✅ File found at:', finalFilePath);
      }
    } else {
      console.log('✅ File found at primary location:', finalFilePath);
    }

    // Read the file
    const fileBuffer = await readFile(finalFilePath);
    
    // Determine content type based on file extension
    const extension = finalFilePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'epub':
        contentType = 'application/epub+zip';
        break;
      case 'mobi':
        contentType = 'application/x-mobipocket-ebook';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
} 