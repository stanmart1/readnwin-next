import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { query } from '@/utils/database';
import { sanitizeLogInput } from '@/utils/security-safe';

// Helper function to validate admin access and privilege escalation
async function validateAdminAccess(session: any, userId: number) {
  // Check if user is admin
  const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
  if (!isAdmin) {
    return { error: 'Admin access required', status: 403 };
  }

  // Check if current user is super_admin
  const isSuperAdmin = session.user.role === 'super_admin';
  
  // Get user roles to check if target user is super_admin
  const userRoles = await rbacService.getUserRoles(userId);
  const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role_name === 'super_admin');
  
  // Prevent non-super_admin users from accessing super_admin user libraries
  if (targetUserIsSuperAdmin && !isSuperAdmin) {
    return { error: 'Access denied: Insufficient privileges', status: 403 };
  }

  return { error: null, status: 200 };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Validate authorization
    const authResult = await validateAdminAccess(session, userId);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Validate authorization
    const authResult = await validateAdminAccess(session, userId);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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

    // Add book to user's library using sync service
    try {
      const { LibrarySyncService } = await import('@/utils/library-sync-service');
      await LibrarySyncService.assignBookToUser(userId, bookId, parseInt(session.user.id), reason);

      return NextResponse.json({ 
        success: true, 
        message: 'Book added to user library successfully'
      });
    } catch (libraryError) {
      // Check if it's a duplicate entry error
      if (libraryError instanceof Error && libraryError.message.includes('duplicate')) {
        return NextResponse.json({ 
          error: 'Book already exists in user library' 
        }, { status: 409 });
      }
      throw libraryError;
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

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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

    // Validate authorization for DELETE operation
    const authResult = await validateAdminAccess(session, userId);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get book info for audit log
    const bookResult = await query(`
      SELECT id, title FROM books WHERE id = $1
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Remove book from user's library using sync service
    try {
      const { LibrarySyncService } = await import('@/utils/library-sync-service');
      await LibrarySyncService.removeBookFromUser(userId, parseInt(bookId), parseInt(session.user.id));

      return NextResponse.json({ 
        success: true, 
        message: 'Book removed from user library successfully' 
      });
    } catch (removalError) {
      if (removalError instanceof Error && removalError.message.includes('not found')) {
        return NextResponse.json({ 
          error: 'Book not found in user library' 
        }, { status: 404 });
      }
      throw removalError;
    }

  } catch (error) {
    console.error('Error removing book from user library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 