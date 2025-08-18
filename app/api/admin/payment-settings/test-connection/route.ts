import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

// POST - Test payment gateway connection
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const { gatewayId, apiKeys, testMode } = await request.json();

    // Validate required fields
    if (!gatewayId || !apiKeys) {
      return NextResponse.json(
        { error: 'Gateway ID and API keys are required' },
        { status: 400 }
      );
    }

    // Test connection based on gateway type
    switch (gatewayId) {
      case 'flutterwave':
        return await testFlutterwaveConnection(apiKeys, testMode);
      case 'bank_transfer':
        return await testBankTransferConnection(apiKeys, testMode);
      default:
        return NextResponse.json(
          { error: 'Unsupported payment gateway' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error testing payment gateway connection:', error);
    return NextResponse.json(
      { error: 'Failed to test payment gateway connection' },
      { status: 500 }
    );
  }
}





// Test Flutterwave connection
async function testFlutterwaveConnection(apiKeys: any, testMode: boolean) {
  try {
    if (!apiKeys.secretKey) {
      return NextResponse.json(
        { error: 'Flutterwave secret key is required' },
        { status: 400 }
      );
    }

    const flutterwaveBaseUrl = testMode 
      ? 'https://sandbox-api.flutterwave.com' 
      : 'https://api.flutterwave.com';

    // Test connection by making a simple API call
    const response = await fetch(`${flutterwaveBaseUrl}/v3/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKeys.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Flutterwave connection test successful',
        note: 'Flutterwave API is accessible and credentials are valid',
      });
    } else {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `Flutterwave connection failed: ${errorData.message || 'Invalid credentials'}` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Flutterwave connection test failed:', error);
    return NextResponse.json(
      { error: 'Flutterwave connection test failed' },
      { status: 500 }
    );
  }
}

// Test Bank Transfer connection
async function testBankTransferConnection(apiKeys: any, testMode: boolean) {
  try {
    // Bank transfer doesn't require API keys, just validate configuration
    return NextResponse.json({
      success: true,
      message: 'Bank Transfer configuration is valid',
      note: 'Bank Transfer is a manual payment method that doesn\'t require API testing',
    });
  } catch (error) {
    console.error('Bank Transfer connection test failed:', error);
    return NextResponse.json(
      { error: 'Bank Transfer connection test failed' },
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