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

    // Get notification statistics
    const stats = await ecommerceService.getAdminNotificationStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 