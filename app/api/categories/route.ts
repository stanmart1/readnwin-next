import { NextRequest, NextResponse } from 'next/server';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function GET(request: NextRequest) {
  try {
    const categories = await ecommerceService.getCategories();

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 