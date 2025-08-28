import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  if (error.code === '23505') { // PostgreSQL unique violation
    return NextResponse.json(
      { error: 'Resource already exists' },
      { status: 409 }
    );
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    return NextResponse.json(
      { error: 'Referenced resource not found' },
      { status: 400 }
    );
  }

  if (error.message?.includes('permission')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function validateApiResponse(data: any): boolean {
  return data && typeof data === 'object' && !Array.isArray(data);
}