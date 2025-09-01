import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export class ImageHandler {
  private static getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      case 'svg': return 'image/svg+xml';
      case 'bmp': return 'image/bmp';
      case 'ico': return 'image/x-icon';
      default: return 'image/jpeg';
    }
  }

  private static getImagePaths(filename: string, subfolder?: string): string[] {
    const basePaths = [
      process.cwd(),
      process.cwd() + '/public',
      process.cwd() + '/uploads',
      process.cwd() + '/storage'
    ];

    const paths: string[] = [];
    
    for (const basePath of basePaths) {
      if (subfolder) {
        paths.push(join(basePath, 'uploads', subfolder, filename));
        paths.push(join(basePath, 'public', 'uploads', subfolder, filename));
        paths.push(join(basePath, subfolder, filename));
      }
      paths.push(join(basePath, 'uploads', filename));
      paths.push(join(basePath, 'public', 'uploads', filename));
      paths.push(join(basePath, filename));
    }

    return paths;
  }

  static async serveImage(filename: string, subfolder?: string): Promise<NextResponse> {
    try {
      if (!filename || filename.includes('..') || filename.includes('/')) {
        return new NextResponse('Invalid filename', { status: 400 });
      }

      const possiblePaths = this.getImagePaths(filename, subfolder);
      
      let filePath: string | null = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          filePath = path;
          break;
        }
      }

      if (!filePath) {
        console.log(`Image not found: ${filename} in subfolder: ${subfolder}`);
        
        // Return placeholder image instead of 404
        return this.servePlaceholderImage();
      }

      const imageBuffer = await readFile(filePath);
      const contentType = this.getContentType(filename);

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Content-Length': imageBuffer.length.toString(),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });

    } catch (error) {
      console.error('Error serving image:', error);
      return this.servePlaceholderImage();
    }
  }

  private static servePlaceholderImage(): NextResponse {
    // 1x1 transparent PNG
    const placeholderPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    return new NextResponse(placeholderPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  static async checkImageExists(filename: string, subfolder?: string): Promise<boolean> {
    const possiblePaths = this.getImagePaths(filename, subfolder);
    return possiblePaths.some(path => existsSync(path));
  }
}