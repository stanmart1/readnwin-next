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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || '';
    const isRead = searchParams.get('isRead') || '';
    const userId = searchParams.get('userId') || '';
    const search = searchParams.get('search') || '';

    // Build filters
    const filters: any = {};
    if (type) filters.type = type;
    if (isRead !== '') filters.is_read = isRead === 'true';
    if (userId) filters.user_id = parseInt(userId);
    if (search) filters.search = search;

    // Get notifications with pagination and filters
    const notifications = await ecommerceService.getAdminNotifications(filters, page, limit);

    return NextResponse.json({
      success: true,
      ...notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { userId, type, title, message, metadata, sendToAll } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    if (!sendToAll && !userId) {
      return NextResponse.json(
        { error: 'Either userId or sendToAll must be provided' },
        { status: 400 }
      );
    }

    // Create notification(s)
    let result;
    if (sendToAll) {
      result = await ecommerceService.createSystemNotification({
        type,
        title,
        message,
        metadata,
        createdBy: session.user.id
      });
    } else {
      result = await ecommerceService.createNotification(userId, {
        type,
        title,
        message,
        metadata
      });
    }

    return NextResponse.json({
      success: true,
      notification: result
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { notificationId, isRead, title, message } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing required field: notificationId' },
        { status: 400 }
      );
    }

    // Update notification
    const notification = await ecommerceService.updateNotification(notificationId, {
      isRead,
      title,
      message
    }, session.user.id);

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Delete notification
    const success = await ecommerceService.deleteNotification(parseInt(notificationId), session.user.id);

    return NextResponse.json({
      success,
      message: success ? 'Notification deleted successfully' : 'Failed to delete notification'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 