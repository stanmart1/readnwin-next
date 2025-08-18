import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders';

    if (type === 'orders') {
      // Get user's orders
      const ordersResult = await query(`
        SELECT 
          o.id,
          o.order_number,
          o.created_at,
          o.total_amount,
          o.status,
          o.payment_status
        FROM orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10
      `, [userId]);

      // Get order items for each order
      const orders = await Promise.all(
        ordersResult.rows.map(async (order) => {
          const itemsResult = await query(`
            SELECT 
              oi.id,
              oi.title,
              oi.author_name,
              oi.price,
              b.cover_image_url
            FROM order_items oi
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = $1
          `, [order.id]);

          return {
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            total_amount: parseFloat(order.total_amount),
            status: order.status,
            items: itemsResult.rows.map(item => ({
              id: item.id,
              title: item.title,
              author_name: item.author_name,
              price: parseFloat(item.price),
              cover_image_url: item.cover_image_url
            }))
          };
        })
      );

      return NextResponse.json({
        success: true,
        orders
      });

    } else if (type === 'wishlist') {
      // Get user's wishlist
      const wishlistResult = await query(`
        SELECT 
          wi.id,
          b.title,
          b.author_name,
          b.price,
          b.original_price,
          b.cover_image_url,
          wi.added_at as dateAdded
        FROM wishlist_items wi
        JOIN books b ON wi.book_id = b.id
        WHERE wi.user_id = $1
        ORDER BY wi.added_at DESC
        LIMIT 20
      `, [userId]);

      const wishlist = wishlistResult.rows.map(item => ({
        id: item.id,
        title: item.title,
        author_name: item.author_name,
        price: parseFloat(item.price),
        original_price: item.original_price ? parseFloat(item.original_price) : null,
        cover_image_url: item.cover_image_url,
        dateAdded: item.dateadded
      }));

      return NextResponse.json({
        success: true,
        wishlist
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching orders/wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 