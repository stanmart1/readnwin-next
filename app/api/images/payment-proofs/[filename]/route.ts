import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return new NextResponse('Access denied', { status: 403 });
    }

    const { filename } = params;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    
    const proofPath = process.env.NODE_ENV === 'production'
      ? join('/app/storage/assets/payment-proofs', sanitizedFilename)
      : join(process.cwd(), 'storage', 'assets', 'payment-proofs', sanitizedFilename);
    
    if (!existsSync(proofPath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const fileBuffer = readFileSync(proofPath);
    const contentType = getContentType(sanitizedFilename);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error serving payment proof:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}