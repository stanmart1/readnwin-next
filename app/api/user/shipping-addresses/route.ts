import { NextRequest, NextResponse } from 'next/server';
import { enhancedShippingService } from '@/utils/enhanced-shipping-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const addresses = await enhancedShippingService.getUserShippingAddresses(Number(userId));
    
    return NextResponse.json({ 
      success: true, 
      addresses 
    });
    
  } catch (error) {
    console.error('Error fetching user shipping addresses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...addressData } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const addressId = await enhancedShippingService.saveUserShippingAddress(
      Number(user_id),
      addressData
    );
    
    return NextResponse.json({ 
      success: true, 
      address_id: addressId,
      message: 'Address saved successfully' 
    });
    
  } catch (error) {
    console.error('Error saving shipping address:', error);
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    );
  }
}
