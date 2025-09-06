import { NextRequest, NextResponse } from 'next/server';
import { secureQuery } from '@/utils/secure-database';
import { requireAuth, sanitizeInput } from '@/utils/security-middleware';

// Simple in-memory cache for analytics data
let analyticsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const auth = await requireAuth(request, ['admin', 'super_admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Check cache first
    const now = Date.now();
    if (analyticsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(analyticsCache);
    }

    const { searchParams } = new URL(request.url);
    const period = sanitizeInput(searchParams.get('period') || 'month');
    
    // Validate period parameter
    if (!['day', 'week', 'month', 'year'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }
    
    // Use faster, simpler queries with shorter timeout
    let userCount = 0;
    let bookCount = 0;
    let orderCount = 0;
    let revenue = 0;
    
    // Get basic stats with improved error handling
    try {
      console.log('🔍 Fetching basic stats from database...');
      
      const basicStatsResult = await Promise.race([
        secureQuery(`
          SELECT 
            (SELECT COUNT(*) FROM users) as user_count,
            (SELECT COUNT(*) FROM books) as book_count,
            (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as order_count,
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue
        `),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout after 1.5s')), 1500))
      ]);
      
      const stats = (basicStatsResult as any).rows[0];
      userCount = parseInt(stats.user_count) || 0;
      bookCount = parseInt(stats.book_count) || 0;
      orderCount = parseInt(stats.order_count) || 0;
      revenue = parseFloat(stats.revenue) || 0;
      
      console.log('✅ Stats fetched successfully:', { userCount, bookCount, orderCount, revenue });
    } catch (e) {
      console.error('❌ Basic stats query failed:', e instanceof Error ? e.message : e);
      
      // Try individual queries to identify which table is missing
      try {
        const userResult = await secureQuery('SELECT COUNT(*) as count FROM users');
        userCount = parseInt(userResult.rows[0].count) || 0;
        console.log('✅ Users table accessible, count:', userCount);
      } catch (userError) {
        console.error('❌ Users table error:', userError instanceof Error ? userError.message : userError);
      }
      
      try {
        const bookResult = await secureQuery('SELECT COUNT(*) as count FROM books');
        bookCount = parseInt(bookResult.rows[0].count) || 0;
        console.log('✅ Books table accessible, count:', bookCount);
      } catch (bookError) {
        console.error('❌ Books table error:', bookError instanceof Error ? bookError.message : bookError);
      }
      
      try {
        const orderResult = await secureQuery('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\'');
        orderCount = parseInt(orderResult.rows[0].count) || 0;
        revenue = parseFloat(orderResult.rows[0].revenue) || 0;
        console.log('✅ Orders table accessible, count:', orderCount, 'revenue:', revenue);
      } catch (orderError) {
        console.error('❌ Orders table error:', orderError instanceof Error ? orderError.message : orderError);
      }
    }

    // Get real daily activity from last 7 days
    let dailyActivity = [];
    try {
      const dailyActivityResult = await secureQuery(`
        WITH daily_dates AS (
          SELECT 
            date_trunc('day', generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              '1 day'
            )) as day_date,
            TO_CHAR(generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              '1 day'
            ), 'Dy') as day
        ),
        daily_users AS (
          SELECT 
            DATE(created_at) as activity_date,
            COUNT(DISTINCT id) as new_users
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY DATE(created_at)
        ),
        daily_orders AS (
          SELECT 
            DATE(created_at) as order_date,
            COUNT(id) as order_count
          FROM orders 
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY DATE(created_at)
        )
        SELECT 
          dd.day,
          COALESCE(du.new_users, 0) as active,
          COALESCE(do.order_count, 0) as orders
        FROM daily_dates dd
        LEFT JOIN daily_users du ON DATE(dd.day_date) = du.activity_date
        LEFT JOIN daily_orders do ON DATE(dd.day_date) = do.order_date
        ORDER BY dd.day_date
      `);
      
      dailyActivity = dailyActivityResult.rows.map((row: any) => ({
        day: row.day,
        active: parseInt(row.active) || 0,
        orders: parseInt(row.orders) || 0
      }));
      
    } catch (e) {
      console.error('❌ Error fetching daily activity:', e);
      dailyActivity = [];
    }
    
    // Fetch real recent activities from multiple sources
    let recentActivities = [];
    
    try {
      // Get recent activities from various sources with timeout
      const activitiesPromise = Promise.race([
        Promise.all([
          // Recent orders
          secureQuery(`
            SELECT 
              'New order placed' as action,
              CONCAT(u.first_name, ' ', u.last_name) as user,
              o.created_at,
              'order' as type,
              '' as book,
              CONCAT('₦', o.total_amount) as amount
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY o.created_at DESC
            LIMIT 3
          `),
          // Recent user registrations
          secureQuery(`
            SELECT 
              'New user registered' as action,
              CONCAT(first_name, ' ', last_name) as user,
              created_at,
              'user' as type,
              '' as book,
              '' as amount
            FROM users
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 2
          `),
          // Recent book additions
          secureQuery(`
            SELECT 
              'New book added' as action,
              'Admin' as user,
              created_at,
              'book' as type,
              title as book,
              '' as amount
            FROM books
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 2
          `)
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Activities timeout')), 2000))
      ]);
      
      const [ordersResult, usersResult, booksResult] = await activitiesPromise;
      
      // Combine and sort all activities
      const allActivities = [
        ...ordersResult.rows.map((row: any) => ({
          action: row.action,
          user: row.user || 'Guest User',
          time: getTimeAgo(new Date(row.created_at)),
          type: row.type,
          book: row.book || '',
          amount: row.amount || ''
        })),
        ...usersResult.rows.map((row: any) => ({
          action: row.action,
          user: row.user || 'New User',
          time: getTimeAgo(new Date(row.created_at)),
          type: row.type,
          book: row.book || '',
          amount: row.amount || ''
        })),
        ...booksResult.rows.map((row: any) => ({
          action: row.action,
          user: row.user || 'Admin',
          time: getTimeAgo(new Date(row.created_at)),
          type: row.type,
          book: row.book || '',
          amount: row.amount || ''
        }))
      ];
      
      // Sort by most recent and take top 5
      recentActivities = allActivities
        .sort((a, b) => {
          // Simple time sorting - 'Just now' comes first
          if (a.time === 'Just now') return -1;
          if (b.time === 'Just now') return 1;
          return 0;
        })
        .slice(0, 5);
        
      console.log('✅ Recent activities fetched:', recentActivities.length);
      
    } catch (activitiesError) {
      console.error('❌ Error fetching recent activities:', activitiesError);
      // Fallback to system activities
      recentActivities = [
        {
          action: 'Dashboard loaded',
          user: 'System',
          time: 'Just now',
          type: 'system',
          book: '',
          amount: ''
        },
        {
          action: 'Analytics updated',
          user: 'System',
          time: '2 minutes ago',
          type: 'system',
          book: '',
          amount: ''
        }
      ];
    }
    
    function getTimeAgo(date: Date) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return date.toLocaleDateString();
    }
    
    // Get real monthly data from database
    let monthly_sales = [];
    try {
      const monthlyDataResult = await secureQuery(`
        WITH monthly_stats AS (
          SELECT 
            TO_CHAR(date_trunc('month', generate_series(
              CURRENT_DATE - INTERVAL '11 months',
              CURRENT_DATE,
              '1 month'
            )), 'Mon') as month,
            date_trunc('month', generate_series(
              CURRENT_DATE - INTERVAL '11 months',
              CURRENT_DATE,
              '1 month'
            )) as month_date
        )
        SELECT 
          ms.month,
          COALESCE(SUM(o.total_amount), 0) as sales,
          COALESCE(COUNT(o.id), 0) as orders,
          COALESCE(COUNT(DISTINCT u.id), 0) as users
        FROM monthly_stats ms
        LEFT JOIN orders o ON date_trunc('month', o.created_at) = ms.month_date
        LEFT JOIN users u ON date_trunc('month', u.created_at) = ms.month_date
        GROUP BY ms.month, ms.month_date
        ORDER BY ms.month_date
      `);
      
      monthly_sales = monthlyDataResult.rows.map((row: any) => ({
        month: row.month,
        sales: parseFloat(row.sales) || 0,
        orders: parseInt(row.orders) || 0,
        users: parseInt(row.users) || 0
      }));
      
    } catch (e) {
      console.error('❌ Error fetching monthly data:', e);
      // Fallback to current month only
      const currentMonth = new Date().toLocaleDateString('en', { month: 'short' });
      monthly_sales = [{
        month: currentMonth,
        sales: revenue,
        orders: orderCount,
        users: userCount
      }];
    }

    const response = {
      success: true,
      analytics: {
        totalUsers: userCount,
        totalBooks: bookCount,
        total_revenue: revenue,
        total_orders: orderCount,
        average_order_value: orderCount > 0 ? revenue / orderCount : 0,
        monthly_sales: monthly_sales,
        top_books: [],
        category_sales: [],
        recentOrders: [],
        lowStockBooks: [],
        recentActivities,
        dailyActivity
      }
    };
    
    // Cache the response
    analyticsCache = response;
    cacheTimestamp = now;
    
    console.log('📊 Returning cached analytics response');
    
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