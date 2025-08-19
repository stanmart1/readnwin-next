import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import ModernBookService from '@/lib/services/ModernBookService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = await ecommerceService.getBookById(id);
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      book
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Book update request received for ID: ${params.id}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('❌ Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 User ID:', session.user.id);

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.update'
    );
    
    if (!hasPermission) {
      console.log('❌ Insufficient permissions for user:', session.user.id);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      console.log('❌ Invalid book ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Parsing request body...');
    const body = await request.json();
    console.log('🔍 Request body:', JSON.stringify(body, null, 2));
    
    // Check if book exists before attempting update
    const existingBook = await ecommerceService.getBookById(id);
    if (!existingBook) {
      console.log('❌ Book not found:', id);
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    console.log('🔍 Found existing book:', existingBook.title);
    
    // Validate required fields only if they're being updated
    if (body.title !== undefined && (!body.title || body.title.trim() === '')) {
      console.log('❌ Missing or empty title');
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (body.price !== undefined && (!body.price || isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0)) {
      console.log('❌ Invalid price:', body.price);
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }

    // Validate boolean fields
    if (body.is_featured !== undefined && typeof body.is_featured !== 'boolean') {
      console.log('❌ Invalid is_featured value:', body.is_featured);
      return NextResponse.json(
        { error: 'is_featured must be a boolean value' },
        { status: 400 }
      );
    }

    if (body.is_bestseller !== undefined && typeof body.is_bestseller !== 'boolean') {
      console.log('❌ Invalid is_bestseller value:', body.is_bestseller);
      return NextResponse.json(
        { error: 'is_bestseller must be a boolean value' },
        { status: 400 }
      );
    }

    if (body.is_new_release !== undefined && typeof body.is_new_release !== 'boolean') {
      console.log('❌ Invalid is_new_release value:', body.is_new_release);
      return NextResponse.json(
        { error: 'is_new_release must be a boolean value' },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to update book...');
    
    // Update book
    const book = await ecommerceService.updateBook(id, body);
    
    if (!book) {
      console.log('❌ Book update failed - book not found after update');
      return NextResponse.json(
        { error: 'Book update failed - book not found' },
        { status: 404 }
      );
    }

    console.log('✅ Book updated successfully');

    // Log audit event
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'content.update',
        'books',
        book.id,
        { 
          title: book.title, 
          changes: body,
          previous_values: {
            is_featured: existingBook.is_featured,
            is_bestseller: existingBook.is_bestseller,
            is_new_release: existingBook.is_new_release,
            status: existingBook.status,
            price: existingBook.price
          }
        },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
      console.log('✅ Audit event logged');
    } catch (auditError) {
      console.warn('⚠️ Failed to log audit event:', auditError);
      // Don't fail the update if audit logging fails
    }

    return NextResponse.json({
      success: true,
      book,
      message: 'Book updated successfully',
      changes: body
    });

  } catch (error) {
    console.error('❌ Error updating book:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code || 'Unknown'
    });
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A book with this ISBN already exists' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'Invalid author or category selected' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('not null')) {
        return NextResponse.json(
          { error: 'Required fields cannot be empty' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('database') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update book',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Book deletion request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('❌ Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 User ID:', session.user.id);

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.delete'
    );
    
    if (!hasPermission) {
      console.log('❌ Insufficient permissions for user:', session.user.id);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const id = parseInt(params.id);
    console.log('🔍 Book ID to delete:', id);
    
    if (isNaN(id)) {
      console.log('❌ Invalid book ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete book...');
    const deleted = await ecommerceService.deleteBook(id);
    
    if (!deleted) {
      console.log('❌ Book deletion failed - book not found or could not be deleted');
      return NextResponse.json(
        { 
          error: 'Book not found or could not be deleted',
          details: 'The book may not exist or there may be database constraints preventing deletion'
        },
        { status: 404 }
      );
    }

    console.log('✅ Book deleted successfully');

    // Log audit event
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'content.delete',
        'books',
        id,
        { book_id: id },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
      console.log('✅ Audit event logged');
    } catch (auditError) {
      console.warn('⚠️ Failed to log audit event:', auditError);
      // Don't fail the deletion if audit logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting book:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code || 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 