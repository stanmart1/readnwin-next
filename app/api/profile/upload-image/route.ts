import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Create directory based on environment
    const uploadsDir = process.env.NODE_ENV === 'production'
      ? join('/app/storage/uploads/profiles')
      : join(process.cwd(), 'public', 'uploads', 'profiles');

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `profile_${session.user.id}_${timestamp}.${ext}`;
    const filePath = join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const imageUrl = `/api/images/profiles/${fileName}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}