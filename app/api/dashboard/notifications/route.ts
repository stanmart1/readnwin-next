import { NextResponse } from 'next/server';

// Dashboard notifications feature has been removed
export async function GET() {
  return NextResponse.json(
    { error: 'Dashboard notifications feature has been removed' },
    { status: 404 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Dashboard notifications feature has been removed' },
    { status: 404 }
  );
}