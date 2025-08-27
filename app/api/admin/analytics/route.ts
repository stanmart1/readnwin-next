import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Analytics API called');
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    
    console.log('📊 Period:', period);
    
    // Use simple queries with timeouts
    let userCount = 0;
    let bookCount = 0;
    let orderCount = 0;
    let revenue = 0;
    
    try {
      const userResult = await Promise.race([
        query('SELECT COUNT(*) as count FROM users'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      userCount = parseInt(userResult.rows[0].count) || 0;
    } catch (e) {
      console.log('User count query failed');
    }
    
    try {
      const bookResult = await Promise.race([
        query('SELECT COUNT(*) as count FROM books'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      bookCount = parseInt(bookResult.rows[0].count) || 0;
    } catch (e) {
      console.log('Book count query failed');
    }
    
    try {
      const orderResult = await Promise.race([
        query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      orderCount = parseInt(orderResult.rows[0].count) || 0;
      revenue = parseFloat(orderResult.rows[0].revenue) || 0;
      console.log('📊 Order count from DB:', orderCount);
      console.log('📊 Revenue from DB:', revenue);
    } catch (e) {
      console.log('Order query failed');
    }

    // Get real daily activity data
    let dailyActivity = [];
    try {
      const dailyResult = await Promise.race([
        query(`
          SELECT 
            EXTRACT(dow FROM created_at) as dow,
            TO_CHAR(created_at, 'Dy') as day,
            COUNT(DISTINCT user_id) as active,
            COUNT(*) as orders
          FROM orders 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY EXTRACT(dow FROM created_at), TO_CHAR(created_at, 'Dy')
          ORDER BY EXTRACT(dow FROM created_at)
        `),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]);
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dataMap = new Map();
      dailyResult.rows.forEach(row => {
        dataMap.set(parseInt(row.dow), {
          day: row.day,
          active: parseInt(row.active),
          orders: parseInt(row.orders)
        });
      });
      
      dailyActivity = days.map((day, index) => 
        dataMap.get(index) || { day, active: 0, orders: 0 }
      );
    } catch (e) {
      console.log('Daily activity query failed');
      dailyActivity = [
        { day: 'Mon', active: 0, orders: 0 },
        { day: 'Tue', active: 0, orders: 0 },
        { day: 'Wed', active: 0, orders: 0 },
        { day: 'Thu', active: 0, orders: 0 },
        { day: 'Fri', active: 0, orders: 0 },
        { day: 'Sat', active: 0, orders: 0 },
        { day: 'Sun', active: 0, orders: 0 }
      ];
    }
    
    // Get real recent activities
    let recentActivities = [];
    try {
      const activitiesResult = await Promise.race([
        query(`
          SELECT 
            'Order placed' as action,
            CONCAT(u.first_name, ' ', u.last_name) as user,
            o.created_at,
            'order' as type,
            '' as book,
            CONCAT('₦', o.total_amount) as amount
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
          ORDER BY o.created_at DESC
          LIMIT 10
        `),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]);
      
      recentActivities = activitiesResult.rows.map(row => ({
        action: row.action,
        user: row.user || 'Unknown User',
        time: getTimeAgo(new Date(row.created_at)),
        type: row.type,
        book: row.book,
        amount: row.amount
      }));
    } catch (e) {
      console.log('Recent activities query failed');
      recentActivities = [
        {
          action: 'System initialized',
          user: 'System',
          time: 'Just now',
          type: 'system',
          book: '',
          amount: ''
        }
      ];
    }
    
    function getTimeAgo(date) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return date.toLocaleDateString();
    }
    
    // Get real monthly sales data
    let monthly_sales = [];
    try {
      const salesResult = await Promise.race([
        query(`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            SUM(total_amount) as sales,
            COUNT(*) as orders
          FROM orders 
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(month FROM created_at)
          ORDER BY EXTRACT(month FROM created_at)
        `),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]);
      
      monthly_sales = salesResult.rows.map(row => ({
        month: row.month,
        sales: parseFloat(row.sales) || 0,
        orders: parseInt(row.orders) || 0
      }));
    } catch (e) {
      console.log('Monthly sales query failed');
      monthly_sales = [
        { month: 'Jan', sales: 0, orders: 0 },
        { month: 'Feb', sales: 0, orders: 0 },
        { month: 'Mar', sales: 0, orders: 0 }
      ];
    }

    const response = {
      success: true,
      analytics: {
        totalUsers: userCount,
        totalBooks: bookCount,
        total_revenue: revenue,
        total_orders: orderCount,
        average_order_value: orderCount > 0 ? revenue / orderCount : 0,
        monthly_sales,
        top_books: [],
        category_sales: [],
        recentOrders: [],
        lowStockBooks: [],
        recentActivities,
        dailyActivity
      }
    };
    
    console.log('📊 Returning analytics response');
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        analytics: {
          totalUsers: 0,
          totalBooks: 0,
          total_revenue: 0,
          total_orders: 0,
          recentOrders: [],
          recentActivities: [],
          dailyActivity: [],
          monthly_sales: []
        }
      },
      { status: 500 }
    );
  }
}