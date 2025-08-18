import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'FAQ test route is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test FAQ route:', error);
    return NextResponse.json(
      { success: false, error: 'Test route failed' },
      { status: 500 }
    );
  }
} 