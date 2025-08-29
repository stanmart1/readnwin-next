import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fast permission check based on user role
    const userRole = session.user.role;
    let permissions: string[] = [];
    
    if (userRole === 'super_admin') {
      // Super admin gets ALL permissions
      permissions = [
        // System permissions
        'system.analytics', 'system.audit_logs', 'system.settings',
        // User management
        'users.read', 'users.create', 'users.update', 'users.delete', 'users.manage_roles',
        // Role management
        'roles.read', 'roles.create', 'roles.update', 'roles.delete', 'roles.manage_permissions',
        // Permission management
        'permissions.create', 'permissions.update', 'permissions.delete',
        // Content management
        'content.read', 'content.create', 'content.update', 'content.delete', 'content.publish', 'content.moderate', 'content.aboutus',
        // Book management
        'books.read', 'books.create', 'books.update', 'books.delete',
        // Author management
        'authors.create', 'authors.update', 'authors.delete',
        // Order management
        'orders.read', 'orders.create', 'orders.update', 'orders.delete',
        // Blog management
        'blog.create', 'blog.update', 'blog.delete',
        // FAQ management
        'faq.create', 'faq.update', 'faq.delete',
        // Email management
        'email.create', 'email.update', 'email.delete', 'email.send'
      ];
    } else if (userRole === 'admin') {
      // Admin gets most permissions except super admin specific ones
      permissions = [
        'system.analytics', 'system.settings',
        'users.read', 'users.create', 'users.update',
        'roles.read',
        'content.read', 'content.create', 'content.update', 'content.moderate', 'content.aboutus',
        'books.read', 'books.create', 'books.update', 'books.delete',
        'orders.read', 'orders.update',
        'blog.create', 'blog.update',
        'faq.create', 'faq.update',
        'email.create', 'email.update'
      ];
    } else {
      // Regular users get basic read permissions
      permissions = ['books.read', 'content.read'];
    }

    return NextResponse.json({
      success: true,
      permissions
    });

  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 