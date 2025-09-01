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
    
    // In production Docker, files are in different locations
    const isProduction = process.env.NODE_ENV === 'production';
    const isCoverImage = pathArray[0] === 'covers';
    
    let possiblePaths: string[];
    
    if (isProduction) {
      // Production Docker paths - prioritize persistent storage
      possiblePaths = [
        join('/app/storage/uploads', ...pathArray),
        join('/app/storage/public/uploads', ...pathArray),
        join('/app/storage', ...pathArray),
        join('/app/public/uploads', ...pathArray),
        join('/app/uploads', ...pathArray),
        join('/app/.next/standalone/public/uploads', ...pathArray),
        join(process.cwd(), 'public/uploads', ...pathArray)
      ];
    } else {
      // Development paths
      possiblePaths = [
        join(process.cwd(), 'public/uploads', ...pathArray),
        join(process.cwd(), 'uploads', ...pathArray)
      ];
    }
    
    console.log(`📁 Searching for file in paths:`, possiblePaths);
    
    // Find the first existing file
    let filePath = possiblePaths.find(path => {
      const exists = existsSync(path);
      console.log(`📁 Checking ${path}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
      return exists;
    });
    
    if (!filePath) {
      console.log('❌ File not found at any location:', {
        requested: pathArray,
        isCoverImage,
        tried: possiblePaths,
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV,
        dockerEnv: process.env.DOCKER_ENV,
        platform: process.platform
      });
      
      // Return detailed error for debugging in production
      return NextResponse.json(
        { 
          error: 'File not found',
          debug: {
            requested: pathArray.join('/'),
            environment: process.env.NODE_ENV,
            searchedPaths: possiblePaths,
            cwd: process.cwd()
          }
        },
        { status: 404 }
      );
    }
    
    console.log('✅ File found at:', filePath);

    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
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
    return new NextResponse(new Uint8Array(fileBuffer), {
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