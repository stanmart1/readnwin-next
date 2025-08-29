import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { Pool } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
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

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = process.env.NODE_ENV === 'production'
    ? '/app/storage/uploads/works'
    : join(process.cwd(), 'public', 'uploads', 'works');
  
  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`✅ Created upload directory: ${uploadDir}`);
    }
  } catch (error) {
    console.error(`❌ Error creating upload directory: ${uploadDir}`, error);
    throw error;
  }
  
  return uploadDir;
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_UNAUTHORIZED',
        message: 'Please log in to access this resource'
      }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.read'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to view works'
      }, { status: 403 });
    }

    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        id, 
        title, 
        description, 
        image_path, 
        alt_text, 
        order_index, 
        is_active, 
        created_at, 
        updated_at
      FROM works 
      ORDER BY order_index ASC, created_at DESC
    `);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      works: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching works:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch works' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_UNAUTHORIZED',
        message: 'Please log in to create works'
      }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.create'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to create works'
      }, { status: 403 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const alt_text = formData.get('alt_text') as string;
    const order_index = parseInt(formData.get('order_index') as string) || 0;
    const is_active = formData.get('is_active') === 'true';

    if (!image || !title || !alt_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Save image file
    const uploadDir = await ensureUploadDir();
    const filename = generateFilename(image.name);
    const filePath = join(uploadDir, filename);
    
    // Set API route path
    const relativePath = `/api/images/works/${filename}`;

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO works (title, description, image_path, alt_text, order_index, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, image_path, alt_text, order_index, is_active, created_at, updated_at
    `, [title, description, relativePath, alt_text, order_index, is_active]);
    
    client.release();

    return NextResponse.json({
      success: true,
      work: result.rows[0],
      message: 'Work image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading work:', error);
    
    // Enhanced error categorization
    let errorCode = 'SERVER_ERROR';
    let errorMessage = 'Failed to upload work image';
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        errorCode = 'FILE_SYSTEM_ERROR';
        errorMessage = 'File system error. Please check upload directory permissions.';
      } else if (error.message.includes('database') || error.message.includes('connection')) {
        errorCode = 'DATABASE_ERROR';
        errorMessage = 'Database connection error. Please try again.';
      } else if (error.message.includes('timeout')) {
        errorCode = 'TIMEOUT_ERROR';
        errorMessage = 'Request timed out. Please try again.';
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: errorCode,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 