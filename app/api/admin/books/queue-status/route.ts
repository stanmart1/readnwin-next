import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { BookProcessingQueue } from '@/utils/book-processing-queue';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const status = await BookProcessingQueue.getQueueStatus();
    
    return NextResponse.json({
      success: true,
      queue: status,
      isRunning: true // Queue is always running in production
    });

  } catch (error) {
    logger.error('Error getting queue status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { action } = body;

    if (action === 'retry-failed') {
      const retriedCount = await BookProcessingQueue.retryFailedBooks();
      
      return NextResponse.json({
        success: true,
        message: `Queued ${retriedCount} failed books for retry`,
        retriedCount
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    logger.error('Error processing queue action:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}