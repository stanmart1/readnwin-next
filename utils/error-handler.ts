import { NextResponse } from 'next/server';

export function handleApiError(error: any) {
  console.error('API Error:', error);
  
  if (error.message?.includes('permission')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }
  
  if (error.message?.includes('not found')) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }
  
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}