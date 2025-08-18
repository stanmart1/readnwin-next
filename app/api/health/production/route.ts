import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const healthChecks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        database: false,
        mediaRoot: false,
        bookFiles: false,
        tempDirectory: false,
        databaseSchema: false
      },
      errors: [] as string[]
    };

    // Check database connection
    try {
      const dbResult = await query('SELECT NOW() as current_time, version() as version');
      healthChecks.checks.database = true;
    } catch (error) {
      healthChecks.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check database schema
    try {
      const schemaResult = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name IN ('html_file_path', 'processing_status')
      `);
      
      const hasHtmlPath = schemaResult.rows.some(row => row.column_name === 'html_file_path');
      const hasProcessingStatus = schemaResult.rows.some(row => row.column_name === 'processing_status');
      
      healthChecks.checks.databaseSchema = hasHtmlPath && hasProcessingStatus;
      
      if (!hasHtmlPath || !hasProcessingStatus) {
        healthChecks.errors.push('Database schema missing required columns');
      }
    } catch (error) {
      healthChecks.errors.push(`Database schema check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check uploads directory
    const mediaRoot = process.env.NODE_ENV === 'production' ? '/uploads' : path.join(process.cwd(), 'uploads');
    try {
      if (fs.existsSync(mediaRoot)) {
        healthChecks.checks.mediaRoot = true;
        
        // Check subdirectories
        const subdirs = [
          path.join(mediaRoot, 'books', 'html'),
          path.join(mediaRoot, 'books', 'originals'),
          path.join(mediaRoot, 'books', 'assets', 'images'),
          path.join(mediaRoot, 'books', 'assets', 'fonts'),
          path.join(mediaRoot, 'temp')
        ];
        
        const allSubdirsExist = subdirs.every(dir => fs.existsSync(dir));
        if (!allSubdirsExist) {
          healthChecks.errors.push('Some uploads subdirectories are missing');
        }
      } else {
        healthChecks.errors.push('uploads directory does not exist');
      }
    } catch (error) {
      healthChecks.errors.push(`Media root check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check book-files directory
    const bookFilesDir = process.env.NODE_ENV === 'production' ? '/app/book-files' : path.join(process.cwd(), 'book-files');
    try {
      if (fs.existsSync(bookFilesDir)) {
        healthChecks.checks.bookFiles = true;
      } else {
        healthChecks.errors.push('book-files directory does not exist');
      }
    } catch (error) {
      healthChecks.errors.push(`Book files check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check temp directory
    const tempDir = path.join(mediaRoot, 'temp');
    try {
      if (fs.existsSync(tempDir)) {
        healthChecks.checks.tempDirectory = true;
        
        // Check if temp directory is writable
        const testFile = path.join(tempDir, 'health-check-test.txt');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
      } else {
        healthChecks.errors.push('temp directory does not exist');
      }
    } catch (error) {
      healthChecks.errors.push(`Temp directory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Determine overall health
    const allChecksPassed = Object.values(healthChecks.checks).every(check => check === true);
    const statusCode = allChecksPassed ? 200 : 503;

    return NextResponse.json({
      status: allChecksPassed ? 'healthy' : 'unhealthy',
      ...healthChecks
    }, { status: statusCode });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 