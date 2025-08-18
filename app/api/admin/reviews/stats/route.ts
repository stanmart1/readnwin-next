import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function GET(request: NextRequest) {
  try {
    // Get admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get review statistics with error handling
    try {
      const stats = await ecommerceService.getAdminReviewStats();
      
      return NextResponse.json({
        success: true,
        stats
      });
    } catch (dbError) {
      console.error('Database error fetching review stats:', dbError);
      
      // Return default stats if database query fails
      return NextResponse.json({
        success: true,
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          featured: 0,
          averageRating: 0
        }
      });
    }

  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 