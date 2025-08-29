import { NextResponse } from 'next/server';

// Admin notifications feature has been removed
export async function DELETE() {
  return NextResponse.json(
    { error: 'Admin notifications feature has been removed' },
    { status: 404 }
  );
}