import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { existsSync, accessSync, constants } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const uploadsDir = process.env.NODE_ENV === 'production'
      ? join('/app/storage/assets/payment-proofs')
      : join(process.cwd(), 'storage', 'assets', 'payment-proofs');

    const checks = {
      environment: process.env.NODE_ENV,
      uploadDirectory: uploadsDir,
      directoryExists: false,
      directoryWritable: false,
      error: null
    };

    try {
      checks.directoryExists = existsSync(uploadsDir);
      
      if (checks.directoryExists) {
        accessSync(uploadsDir, constants.W_OK);
        checks.directoryWritable = true;
      }
    } catch (error) {
      checks.error = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      success: true,
      checks,
      message: checks.directoryExists && checks.directoryWritable 
        ? 'Upload system is ready' 
        : 'Upload system has issues'
    });

  } catch (error) {
    console.error('Error testing upload system:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}