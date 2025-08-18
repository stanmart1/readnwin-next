import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { blogService } from '@/utils/blog-service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - Upload images for a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.update'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Verify the post exists
    const post = await blogService.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const uploadedImages = [];

    for (const image of images) {
      if (!image || image.size === 0) continue;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json({ 
          error: `Invalid file type: ${image.type}. Allowed types: ${allowedTypes.join(', ')}` 
        }, { status: 400 });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        return NextResponse.json({ 
          error: `File too large: ${image.name}. Maximum size is 5MB` 
        }, { status: 400 });
      }

      try {
        // Create upload directory if it doesn't exist
        const uploadDir = join('/uploads', 'blog');
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = image.name.split('.').pop();
        const filename = `blog-${postId}-${timestamp}-${randomString}.${extension}`;
        const filePath = join(uploadDir, filename);

        // Save file
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save image record to database
        const imageRecord = {
          post_id: postId,
          filename,
          original_name: image.name,
          file_path: `/uploads/blog/${filename}`,
          file_size: image.size,
          mime_type: image.type,
          alt_text: image.name.split('.')[0], // Use filename as alt text
          caption: '',
          is_featured: false,
          sort_order: 0
        };

        const savedImage = await blogService.addImage(imageRecord);
        uploadedImages.push(savedImage);

      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ 
          error: `Failed to upload image: ${image.name}` 
        }, { status: 500 });
      }
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'blog_images.upload',
      'blog_images',
      postId,
      { post_id: postId, images_count: uploadedImages.length },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Error uploading blog images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get images for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.read'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Verify the post exists
    const post = await blogService.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get images for the post
    const images = await blogService.getPostImages(postId);

    return NextResponse.json({
      success: true,
      images
    });

  } catch (error) {
    console.error('Error fetching blog images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.delete'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const success = await blogService.deleteImage(parseInt(imageId));
    if (!success) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'blog_images.delete',
      'blog_images',
      parseInt(params.id),
      { image_id: imageId },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 