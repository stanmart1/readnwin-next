import { sanitizeInput } from '@/lib/security';
import { requireAdmin } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = sanitizeInput(file.name).replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `team_${timestamp}_${originalName}`;
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'images', 'team');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Return the public URL
    const url = `/images/team/${filename}`;
    
    return NextResponse.json({ 
      url,
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    logger.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}