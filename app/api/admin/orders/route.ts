import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { rbacService } from '@/utils/rbac-service';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    
    console.log('🔍 Orders API - User role:', userRole, 'Is Admin:', isAdmin);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatusFilter = searchParams.get('payment_status') || '';
    const paymentMethodFilter = searchParams.get('payment_method') || '';
    const dateFilter = searchParams.get('dateFilter') || 'all';

    // Build filters
    const filters: any = {};
    
    if (search) {
      filters.search = search;
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (paymentStatusFilter) {
      filters.payment_status = paymentStatusFilter;
    }
    
    if (paymentMethodFilter) {
      filters.payment_method = paymentMethodFilter;
    }
    
    if (dateFilter && dateFilter !== 'all') {
      filters.dateFilter = dateFilter;
    }

    // Build query parameters dynamically
    const queryParams: any[] = [];
    let paramIndex = 1;

    let whereConditions = 'WHERE 1=1';
    
    if (search) {
      whereConditions += ` AND (o.order_number ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR o.guest_email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status) {
      whereConditions += ` AND o.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (paymentStatusFilter) {
      whereConditions += ` AND o.payment_status = $${paramIndex}`;
      queryParams.push(paymentStatusFilter);
      paramIndex++;
    }
    
    if (paymentMethodFilter) {
      whereConditions += ` AND o.payment_method = $${paramIndex}`;
      queryParams.push(paymentMethodFilter);
      paramIndex++;
    }
    
    if (dateFilter === 'today') {
      whereConditions += ` AND DATE(o.created_at) = CURRENT_DATE`;
    } else if (dateFilter === 'week') {
      whereConditions += ` AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (dateFilter === 'month') {
      whereConditions += ` AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    } else if (dateFilter === 'year') {
      whereConditions += ` AND o.created_at >= CURRENT_DATE - INTERVAL '1 year'`;
    }

    // Get orders with enhanced data
    console.log('🔍 Orders API - Query params:', queryParams);
    console.log('🔍 Orders API - Where conditions:', whereConditions);
    
    // First try with order_items, if it fails, try without
    let result;
    try {
      result = await query(`
        SELECT 
          o.*,
          u.first_name || ' ' || u.last_name as customer_name,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        ${whereConditions}
        GROUP BY o.id, u.first_name, u.last_name
        ORDER BY o.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...queryParams, limit, (page - 1) * limit]);
    } catch (orderItemsError) {
      console.log('🔍 Orders API - order_items table not found, trying without it');
      // Fallback query without order_items
      result = await query(`
        SELECT 
          o.*,
          u.first_name || ' ' || u.last_name as customer_name,
          0 as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereConditions}
        ORDER BY o.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...queryParams, limit, (page - 1) * limit]);
    }

    console.log('🔍 Orders API - Query result count:', result.rows.length);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereConditions}
    `, queryParams);

    const total = parseInt(countResult.rows[0]?.total || '0');
    const pages = Math.ceil(total / limit);
    
    console.log('🔍 Orders API - Total orders:', total, 'Pages:', pages);

    return NextResponse.json({
      success: true,
      orders: result.rows,
      total,
      pages,
      currentPage: page,
      limit
    });

  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'orders.delete'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderIds = searchParams.get('ids');

    if (!orderIds) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      );
    }

    const orderIdArray = orderIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (orderIdArray.length === 0) {
      return NextResponse.json(
        { error: 'No valid order IDs provided' },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    const failedIds: number[] = [];

    // Delete orders one by one to handle errors gracefully
    for (const orderId of orderIdArray) {
      try {
        const deleted = await ecommerceService.deleteOrder(orderId);
        if (deleted) {
          deletedCount++;
          
          // Log audit event for each deleted order
          await rbacService.logAuditEvent(
            parseInt(session.user.id),
            'orders.delete',
            'orders',
            orderId,
            { bulk_delete: true },
            request.headers.get('x-forwarded-for') || request.ip || undefined,
            request.headers.get('user-agent') || undefined
          );
        } else {
          failedIds.push(orderId);
        }
      } catch (error) {
        console.error(`Error deleting order ${orderId}:`, error);
        failedIds.push(orderId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} orders`,
      deleted_count: deletedCount,
      failed_ids: failedIds,
      total_requested: orderIdArray.length
    });

  } catch (error) {
    console.error('Error in bulk delete orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 