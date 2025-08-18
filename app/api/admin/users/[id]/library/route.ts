import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission for managing user libraries
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.manage_roles'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Get user roles to check if target user is super_admin
    const userRoles = await rbacService.getUserRoles(userId);
    const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role_name === 'super_admin');
    
    // Prevent non-super_admin users from accessing super_admin user libraries
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Insufficient privileges' }, { status: 403 });
    }

    // Get user's library
    const userLibrary = await ecommerceService.getUserLibrary(userId);

    return NextResponse.json({ success: true, library: userLibrary });

  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission for managing user libraries
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.manage_roles'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Get user roles to check if target user is super_admin
    const userRoles = await rbacService.getUserRoles(userId);
    const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role_name === 'super_admin');
    
    // Prevent non-super_admin users from modifying super_admin user libraries
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Cannot modify super administrator libraries' }, { status: 403 });
    }

    const { bookId, reason } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    // Verify the book exists
    const bookResult = await query(`
      SELECT id, title FROM books WHERE id = $1
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Add book to user's library
    const success = await ecommerceService.addToLibrary(userId, bookId);

    if (success) {
      // Log the admin action
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
        VALUES ($1, 'library_add', 'user_library', $2, $3, $4)
      `, [userId, bookId, JSON.stringify({ 
        bookTitle: bookResult.rows[0].title,
        reason: reason || 'Admin assignment',
        assignedBy: session.user.id 
      }), session.user.id]);

      return NextResponse.json({ 
        success: true, 
        message: 'Book added to user library successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Book already exists in user library' 
      }, { status: 409 });
    }

  } catch (error) {
    console.error('Error adding book to user library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission for managing user libraries
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.manage_roles'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    // Get book info for audit log
    const bookResult = await query(`
      SELECT id, title FROM books WHERE id = $1
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Remove book from user's library
    const result = await query(`
      DELETE FROM user_library 
      WHERE user_id = $1 AND book_id = $2
    `, [userId, parseInt(bookId)]);

    if (result.rowCount > 0) {
      // Log the admin action
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
        VALUES ($1, 'library_remove', 'user_library', $2, $3, $4)
      `, [userId, parseInt(bookId), JSON.stringify({ 
        bookTitle: bookResult.rows[0].title,
        removedBy: session.user.id 
      }), session.user.id]);

      return NextResponse.json({ 
        success: true, 
        message: 'Book removed from user library successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Book not found in user library' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error removing book from user library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 