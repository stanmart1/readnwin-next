import { NextRequest, NextResponse } from 'next/server';
import { ecommerceService } from '@/utils/ecommerce-service-new';

export async function GET(request: NextRequest) {
  try {
    const shippingMethods = await ecommerceService.getShippingMethods();

    // Transform the data to match the frontend expectations
    const transformedMethods = shippingMethods.map(method => ({
      id: method.id.toString(),
      name: method.name,
      price: parseFloat(method.base_cost) || 0,
      deliveryTime: `${method.estimated_days_min}-${method.estimated_days_max} business days`,
      description: method.description,
      base_cost: parseFloat(method.base_cost) || 0,
      cost_per_item: parseFloat(method.cost_per_item) || 0,
      free_shipping_threshold: parseFloat(method.free_shipping_threshold) || 0,
      estimated_days_min: method.estimated_days_min,
      estimated_days_max: method.estimated_days_max,
      is_active: method.is_active,
      sort_order: method.sort_order
    }));

    return NextResponse.json({
      success: true,
      methods: transformedMethods
    });

  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 