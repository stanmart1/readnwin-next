import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function DELETE(request: NextRequest) {
  try {
    // Get admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid notificationIds array' },
        { status: 400 }
      );
    }

    // Validate that all IDs are numbers
    if (!notificationIds.every(id => typeof id === 'number' && id > 0)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs provided' },
        { status: 400 }
      );
    }

    // Batch delete notifications
    const result = await ecommerceService.batchDeleteNotifications(notificationIds, session.user.id);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} notification(s)`
    });

  } catch (error) {
    console.error('Error batch deleting notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 