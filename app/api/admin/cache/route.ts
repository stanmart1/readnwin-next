import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { imageStorageService } from '@/utils/image-storage-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const stats = await imageStorageService.getCacheStats();
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json({ error: 'Failed to get cache stats' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await imageStorageService.clearCache();
    
    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully. Removed ${result.cleared} items (${result.sizeMB} MB)`,
      cleared: result.cleared,
      sizeMB: result.sizeMB
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}