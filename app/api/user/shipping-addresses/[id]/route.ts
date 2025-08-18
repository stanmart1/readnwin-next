import { NextRequest, NextResponse } from 'next/server';
import { enhancedShippingService } from '@/utils/enhanced-shipping-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = Number(params.id);
    
    if (isNaN(addressId)) {
      return NextResponse.json(
        { error: 'Invalid address ID' },
        { status: 400 }
      );
    }
    
    // For now, we'll use a default user ID since we don't have auth context
    // In a real implementation, you'd get this from the session/token
    const userId = 1; // This should come from authentication
    
    const success = await enhancedShippingService.deleteShippingAddress(addressId, userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Address deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting shipping address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
