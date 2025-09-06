import { sanitizeInput } from '@/lib/security';
import { requireAdmin } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import ImagePathResolver from '@/utils/image-path-resolver';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = sanitizeInput(file.name).split('.').pop();
    const filename = `${sanitizeInput(bookId) || 'book'}_${timestamp}_${randomSuffix}.${extension}`;

    // Use centralized path resolver for consistent storage
    const targetPath = ImagePathResolver.getUploadTargetPath(filename);
    const targetDir = join(targetPath, '..');

    // Create target directory if it doesn't exist
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // Save file to standardized location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(targetPath, buffer);

    // Also save to public/uploads/covers for backward compatibility
    const legacyDir = join(process.cwd(), 'public', 'uploads', 'covers');
    if (!existsSync(legacyDir)) {
      await mkdir(legacyDir, { recursive: true });
    }
    const legacyPath = join(legacyDir, filename);
    await writeFile(legacyPath, buffer);

    // Return standardized URL
    const coverUrl = ImagePathResolver.resolveCoverImageUrl(filename);

    logger.info(`✅ Cover uploaded successfully:`);
    logger.info(`  - Primary location: ${targetPath}`);
    logger.info(`  - Legacy location: ${legacyPath}`);
    logger.info(`  - Public URL: ${coverUrl}`);

    return NextResponse.json({ 
      success: true, 
      coverUrl,
      message: 'Cover uploaded successfully' 
    });

  } catch (error) {
    logger.error('Cover upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload cover image' },
      { status: 500 }
    );
  }
}