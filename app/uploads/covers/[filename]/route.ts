import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Redirect to the proper image API endpoint
  const filename = params.filename;
  const url = new URL(request.url);
  const redirectUrl = new URL(`/api/images/covers/${filename}`, url.origin);
  return NextResponse.redirect(redirectUrl);
}