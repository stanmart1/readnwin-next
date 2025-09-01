import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const uploadDirs = [
      { name: 'public/uploads/covers', path: join(process.cwd(), 'public', 'uploads', 'covers') },
      { name: 'uploads/covers', path: join(process.cwd(), 'uploads', 'covers') },
    ];
    
    const results = uploadDirs.map(dir => {
      if (existsSync(dir.path)) {
        const files = readdirSync(dir.path);
        return {
          directory: dir.name,
          exists: true,
          fileCount: files.length,
          files: files.slice(0, 5) // Show first 5 files
        };
      } else {
        return {
          directory: dir.name,
          exists: false,
          fileCount: 0,
          files: []
        };
      }
    });
    
    return NextResponse.json({
      success: true,
      directories: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}