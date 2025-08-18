import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { Pool } from 'pg';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false // Disable SSL for this database connection
});

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_UNAUTHORIZED',
        message: 'Please log in to update works'
      }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.update'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to update works'
      }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const alt_text = formData.get('alt_text') as string;
    const order_index = parseInt(formData.get('order_index') as string) || 0;
    const is_active = formData.get('is_active') === 'true';

    if (!title || !alt_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Check if work exists
    const existingWork = await client.query('SELECT image_path FROM works WHERE id = $1', [id]);
    if (existingWork.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: 'Work not found' },
        { status: 404 }
      );
    }

    let imagePath = existingWork.rows[0].image_path;

    // Handle new image upload if provided
    if (image) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        client.release();
        return NextResponse.json(
          { success: false, error: 'File must be an image' },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        client.release();
        return NextResponse.json(
          { success: false, error: 'File size must be less than 5MB' },
          { status: 400 }
        );
      }

      // Delete old image file if it exists
      let oldImagePath: string;
      if (process.env.NODE_ENV === 'production') {
        // For production, remove /uploads prefix and use absolute path
        const relativePath = existingWork.rows[0].image_path.replace('/uploads', '');
        oldImagePath = join('/uploads', relativePath);
      } else {
        oldImagePath = join(process.cwd(), 'public', existingWork.rows[0].image_path);
      }
      
      if (existsSync(oldImagePath)) {
        try {
          await unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Save new image file
      let uploadDir: string;
      if (process.env.NODE_ENV === 'production') {
        uploadDir = '/uploads/works';
      } else {
        uploadDir = join(process.cwd(), 'public', 'uploads', 'works');
      }
      
      const filename = generateFilename(image.name);
      const filePath = join(uploadDir, filename);
      
      // Set image path based on environment
      if (process.env.NODE_ENV === 'production') {
        imagePath = `/uploads/works/${filename}`;
      } else {
        imagePath = `/uploads/works/${filename}`;
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    }

    // Update database
    const result = await client.query(`
      UPDATE works 
      SET title = $1, description = $2, image_path = $3, alt_text = $4, order_index = $5, is_active = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING id, title, description, image_path, alt_text, order_index, is_active, created_at, updated_at
    `, [title, description, imagePath, alt_text, order_index, is_active, id]);
    
    client.release();

    return NextResponse.json({
      success: true,
      work: result.rows[0],
      message: 'Work image updated successfully'
    });

  } catch (error) {
    console.error('Error updating work:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update work image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_UNAUTHORIZED',
        message: 'Please log in to delete works'
      }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.delete'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to delete works'
      }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Get work details before deletion
    const existingWork = await client.query('SELECT image_path FROM works WHERE id = $1', [id]);
    if (existingWork.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: 'Work not found' },
        { status: 404 }
      );
    }

    // Delete image file
    let imagePath: string;
    if (process.env.NODE_ENV === 'production') {
      // For production, remove /uploads prefix and use absolute path
      const relativePath = existingWork.rows[0].image_path.replace('/uploads', '');
      imagePath = join('/uploads', relativePath);
    } else {
      imagePath = join(process.cwd(), 'public', existingWork.rows[0].image_path);
    }
    
    if (existsSync(imagePath)) {
      try {
        await unlink(imagePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    // Delete from database
    await client.query('DELETE FROM works WHERE id = $1', [id]);
    client.release();

    return NextResponse.json({
      success: true,
      message: 'Work image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting work:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete work image' },
      { status: 500 }
    );
  }
} 