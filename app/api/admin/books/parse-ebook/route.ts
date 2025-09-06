import { NextRequest, NextResponse } from 'next/server';

// Ebook parsing has been disabled for security
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Ebook parsing is disabled. Books are stored securely without parsing.' 
  }, { status: 410 });
}