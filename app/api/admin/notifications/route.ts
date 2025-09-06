import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextResponse } from 'next/server';

// Admin notifications feature has been removed
export async function GET() {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(
    { error: 'Admin notifications feature has been removed' },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Admin notifications feature has been removed' },
    { status: 404 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Admin notifications feature has been removed' },
    { status: 404 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Admin notifications feature has been removed' },
    { status: 404 }
  );
}