import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface DiscountRequest {
  code: string;
  subtotal: number;
  userId?: string;
}

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  applicableTo?: string[];
  excludedCategories?: string[];
  firstTimeOnly?: boolean;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body: DiscountRequest = await request.json();

    // Validate request
    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { error: 'Valid discount code is required' },
        { status: 400 }
      );
    }

    if (body.subtotal === undefined || body.subtotal < 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      );
    }

    // Mock discount codes (in production, this would be stored in database)
    const discountCodes: { [key: string]: DiscountCode } = {
      'WELCOME10': {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minAmount: 50,
        usageLimit: 1,
        usedCount: 0,
        firstTimeOnly: true,
        description: '10% off your first order over $50'
      },
      'SAVE20': {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        minAmount: 100,
        maxDiscount: 50,
        usageLimit: 5,
        usedCount: 2,
        description: '20% off orders over $100 (max $50 discount)'
      },
      'FREESHIP': {
        code: 'FREESHIP',
        type: 'shipping',
        value: 100,
        minAmount: 75,
        usageLimit: 10,
        usedCount: 5,
        description: 'Free shipping on orders over $75'
      },
      'FLAT10': {
        code: 'FLAT10',
        type: 'fixed',
        value: 10,
        minAmount: 25,
        usageLimit: 100,
        usedCount: 45,
        description: '$10 off orders over $25'
      },
      'BOOKS15': {
        code: 'BOOKS15',
        type: 'percentage',
        value: 15,
        minAmount: 30,
        applicableTo: ['books'],
        usageLimit: 50,
        usedCount: 12,
        description: '15% off books over $30'
      },
      'HOLIDAY25': {
        code: 'HOLIDAY25',
        type: 'percentage',
        value: 25,
        minAmount: 150,
        maxDiscount: 100,
        expiresAt: '2025-12-31T23:59:59Z',
        usageLimit: 1000,
        usedCount: 234,
        description: '25% off orders over $150 (Holiday Special)'
      }
    };

    const discountCode = discountCodes[body.code.toUpperCase()];

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 400 }
      );
    }

    // Check if discount code has expired
    if (discountCode.expiresAt && new Date() > new Date(discountCode.expiresAt)) {
      return NextResponse.json(
        { error: 'Discount code has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
      return NextResponse.json(
        { error: 'Discount code usage limit reached' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (body.subtotal < discountCode.minAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of $${discountCode.minAmount} required` },
        { status: 400 }
      );
    }

    // Check if user has already used first-time only codes
    if (discountCode.firstTimeOnly && session?.user?.id) {
      // In production, check database for previous orders
      // For now, we'll assume it's valid
    }

    // Calculate discount amount
    let discountAmount = 0;
    let discountDescription = discountCode.description;

    switch (discountCode.type) {
      case 'percentage':
        discountAmount = body.subtotal * (discountCode.value / 100);
        if (discountCode.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
        }
        discountDescription = `${discountCode.value}% off`;
        break;

      case 'fixed':
        discountAmount = discountCode.value;
        discountDescription = `$${discountCode.value} off`;
        break;

      case 'shipping':
        discountAmount = Math.min(body.subtotal * 0.1, discountCode.value); // 10% of subtotal, max $100
        discountDescription = 'Free shipping';
        break;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, body.subtotal);

    // Calculate final total
    const finalTotal = body.subtotal - discountAmount;

    return NextResponse.json({
      success: true,
      discount: {
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        amount: Math.round(discountAmount * 100) / 100,
        description: discountDescription,
        minAmount: discountCode.minAmount,
        maxDiscount: discountCode.maxDiscount,
        usageLimit: discountCode.usageLimit,
        usedCount: discountCode.usedCount,
        expiresAt: discountCode.expiresAt,
        applicableTo: discountCode.applicableTo,
        excludedCategories: discountCode.excludedCategories
      },
      subtotal: body.subtotal,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalTotal: Math.round(finalTotal * 100) / 100,
      savings: Math.round(discountAmount * 100) / 100
    });

  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 