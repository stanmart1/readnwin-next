import { NextResponse } from 'next/server';

// Dashboard notifications feature has been removed - return empty data
export async function GET() {
  return NextResponse.json({
    success: true,
    notifications: [],
    unreadCount: 0,
    message: 'Notifications feature is currently disabled'
  });
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Dashboard notifications feature has been removed' },
    { status: 404 }
  );
}