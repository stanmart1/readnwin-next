import { NextRequest, NextResponse } from 'next/server';
import { ImageHandler } from '@/utils/image-handler';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  
  if (!filename) {
    return new NextResponse('Filename is required', { status: 400 });
  }

  return ImageHandler.serveImage(filename, 'works');
}