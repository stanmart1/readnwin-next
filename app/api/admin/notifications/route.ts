import { NextResponse } from 'next/server';

// Admin notifications feature has been removed
export async function GET() {
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