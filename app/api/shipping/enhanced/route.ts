import { NextRequest, NextResponse } from 'next/server';
import { enhancedShippingService } from '@/utils/enhanced-shipping-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'methods':
        const methods = await enhancedShippingService.getShippingMethods();
        return NextResponse.json({ success: true, methods });
        
      case 'zones':
        const zones = await enhancedShippingService.getShippingZones();
        return NextResponse.json({ success: true, zones });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in enhanced shipping API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    switch (action) {
      case 'calculate': {
        const { address, cartSubtotal, itemCount } = body;
        
        if (!address || cartSubtotal === undefined || itemCount === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: address, cartSubtotal, itemCount' },
            { status: 400 }
          );
        }
        
        const calculation = await enhancedShippingService.getShippingCalculation(
          address,
          cartSubtotal,
          itemCount
        );
        
        if (!calculation) {
          return NextResponse.json(
            { error: 'Unable to calculate shipping for this address' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({ success: true, calculation });
      }
        
      case 'cost': {
        const { methodId, cartSubtotal: costCartSubtotal, itemCount: costItemCount } = body;
        
        if (!methodId || costCartSubtotal === undefined || costItemCount === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: methodId, cartSubtotal, itemCount' },
            { status: 400 }
          );
        }
        
        const cost = await enhancedShippingService.calculateShippingCost(
          methodId,
          costCartSubtotal,
          costItemCount
        );
        
        return NextResponse.json({ success: true, shipping_cost: cost });
      }
        
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in enhanced shipping API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
