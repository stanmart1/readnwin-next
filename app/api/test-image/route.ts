import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Check various paths where uploads might be stored
    const pathsToCheck = [
      '/app/storage/uploads/covers',
      '/app/storage/public/uploads/covers',
      '/app/storage/covers',
      '/app/public/uploads/covers',
      '/app/uploads/covers', 
      '/app/.next/standalone/public/uploads/covers',
      join(process.cwd(), 'public/uploads/covers'),
      join(process.cwd(), 'uploads/covers')
    ];
    
    const results = pathsToCheck.map(path => {
      const exists = existsSync(path);
      let files: string[] = [];
      
      if (exists) {
        try {
          files = readdirSync(path).slice(0, 5); // First 5 files
        } catch (e) {
          files = ['Error reading directory'];
        }
      }
      
      return {
        path,
        exists,
        files
      };
    });
    
    return NextResponse.json({
      environment: isProduction ? 'production' : 'development',
      cwd: process.cwd(),
      pathsChecked: results,
      targetFile: '134_in_the_hollow_of_his_hands_1756297948975_4l0g20lg8z7.jpg'
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check paths',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}