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

    // Allow admins and users to view their own payment proofs
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    
    if (!isAdmin) {
      // For non-admin users, verify they own the payment proof
      const { filename } = params;
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
      
      // Extract bank transfer ID from filename (format: proof_{bankTransferId}_{timestamp}_{random}.{ext})
      const filenameParts = sanitizedFilename.split('_');
      if (filenameParts.length < 2 || filenameParts[0] !== 'proof') {
        return new NextResponse('Access denied', { status: 403 });
      }
      
      const bankTransferId = parseInt(filenameParts[1]);
      if (isNaN(bankTransferId)) {
        return new NextResponse('Access denied', { status: 403 });
      }
      
      // Check if the bank transfer belongs to the user
      const { query } = await import('@/utils/database');
      const result = await query(
        'SELECT user_id FROM bank_transfers WHERE id = $1',
        [bankTransferId]
      );
      
      if (!result.rows[0] || result.rows[0].user_id !== parseInt(session.user.id)) {
        return new NextResponse('Access denied', { status: 403 });
      }
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
    
    return new NextResponse(new Uint8Array(fileBuffer), {
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