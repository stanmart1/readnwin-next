import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FooterService } from '@/utils/footer-service';

export async function GET() {
  try {
    let settings = await FooterService.getFooterSettings();
    
    // If no data exists, initialize with defaults
    if (!settings || Object.keys(settings).length === 0) {
      await FooterService.initializeDefaultData();
      settings = await FooterService.getFooterSettings();
    }
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Error fetching footer settings', { error });
    return NextResponse.json({ success: false, error: 'Failed to fetch footer settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, content } = body;
    if (!section || !content) {
      return NextResponse.json({ error: 'Section and content required' }, { status: 400 });
    }

    const success = await FooterService.updateFooterSection(section, content, parseInt(session.user.id));
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }
  } catch (error) {
    logger.error('API Error', { error: error.message, endpoint: request.url });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}