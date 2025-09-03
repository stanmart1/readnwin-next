import { NextRequest, NextResponse } from 'next/server';
import { imageStorageService } from '@/utils/image-storage-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const imageId = parseInt(params.imageId);
    
    if (isNaN(imageId) || imageId <= 0) {
      return new NextResponse('Invalid image ID', { status: 400 });
    }

    // Get variant type from query params
    const { searchParams } = new URL(request.url);
    const variant = searchParams.get('variant');

    let imageData;
    
    if (variant) {
      imageData = await imageStorageService.getImageVariant(imageId, variant);
    } else {
      imageData = await imageStorageService.getImage(imageId);
    }

    if (!imageData) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(imageData.data, {
      headers: {
        'Content-Type': imageData.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${imageId}-${variant || 'original'}"`,
      }
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const imageId = parseInt(params.imageId);
    
    if (isNaN(imageId) || imageId <= 0) {
      return new NextResponse('Invalid image ID', { status: 400 });
    }

    const deleted = await imageStorageService.deleteImage(imageId);
    
    if (!deleted) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Error deleting image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}