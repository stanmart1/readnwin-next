import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  return NextResponse.json({ bookId: params.bookId, analytics: {} });
}