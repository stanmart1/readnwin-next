import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

// Ebook parsing has been disabled for security
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ 
    error: 'Ebook parsing is disabled. Books are stored securely without parsing.' 
  }, { status: 410 });
}