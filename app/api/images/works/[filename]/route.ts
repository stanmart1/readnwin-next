import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    const result = await query(`
      SELECT image_data, mime_type FROM images 
      WHERE filename = $1 AND category = 'work' AND is_active = true
    `, [filename]);
    
    if (result.rows.length === 0) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const image = result.rows[0];
    
    return new NextResponse(image.image_data, {
      headers: {
        'Content-Type': image.mime_type,
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error serving work image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}