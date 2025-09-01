import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cover') as File;
    const bookId = formData.get('bookId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Create covers directory if it doesn't exist
    const coversDir = join(process.cwd(), 'public', 'uploads', 'covers');
    if (!existsSync(coversDir)) {
      await mkdir(coversDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${bookId || 'book'}_${timestamp}.${extension}`;
    const filepath = join(coversDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const coverUrl = `/uploads/covers/${filename}`;

    return NextResponse.json({ 
      success: true, 
      coverUrl,
      message: 'Cover uploaded successfully' 
    });

  } catch (error) {
    console.error('Cover upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload cover image' },
      { status: 500 }
    );
  }
}