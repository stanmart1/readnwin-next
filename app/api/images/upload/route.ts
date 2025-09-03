import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { imageStorageService } from '@/utils/image-storage-service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const altText = formData.get('altText') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const filename = `${category}_${entityId || 'general'}_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;

    const imageId = await imageStorageService.uploadImage({
      filename,
      originalFilename: file.name,
      mimeType: file.type,
      buffer,
      category,
      entityType,
      entityId: entityId ? parseInt(entityId) : undefined,
      altText,
      uploadedBy: parseInt(session.user.id)
    });

    return NextResponse.json({
      success: true,
      imageId,
      filename,
      url: `/api/images/secure/${imageId}`,
      thumbnailUrl: `/api/images/secure/${imageId}?variant=thumbnail`
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}