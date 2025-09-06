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
    return NextResponse.json({ success: false, error: 'Failed to fetch footer settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section, content } = await request.json();
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
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}