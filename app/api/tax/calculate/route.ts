import { NextRequest, NextResponse } from 'next/server';

interface TaxRequest {
  subtotal: number;
  shipping: number;
  address: {
    state: string;
    country: string;
    zipCode: string;
    city?: string;
  };
  items?: Array<{
    price: number;
    quantity: number;
    category?: string;
  }>;
}

interface TaxRate {
  state: string;
  rate: number;
  name: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TaxRequest = await request.json();
    
    // Validate request
    if (body.subtotal === undefined || body.subtotal < 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      );
    }

    if (!body.address?.state || !body.address?.country) {
      return NextResponse.json(
        { error: 'Address information is required' },
        { status: 400 }
      );
    }

    // US State tax rates (simplified - in production, use a tax service API)
    const taxRates: { [key: string]: TaxRate } = {
      'AL': { state: 'AL', rate: 0.04, name: 'Alabama' },
      'AK': { state: 'AK', rate: 0.00, name: 'Alaska' },
      'AZ': { state: 'AZ', rate: 0.056, name: 'Arizona' },
      'AR': { state: 'AR', rate: 0.065, name: 'Arkansas' },
      'CA': { state: 'CA', rate: 0.0825, name: 'California' },
      'CO': { state: 'CO', rate: 0.029, name: 'Colorado' },
      'CT': { state: 'CT', rate: 0.0635, name: 'Connecticut' },
      'DE': { state: 'DE', rate: 0.00, name: 'Delaware' },
      'FL': { state: 'FL', rate: 0.06, name: 'Florida' },
      'GA': { state: 'GA', rate: 0.04, name: 'Georgia' },
      'HI': { state: 'HI', rate: 0.04, name: 'Hawaii' },
      'ID': { state: 'ID', rate: 0.06, name: 'Idaho' },
      'IL': { state: 'IL', rate: 0.0625, name: 'Illinois' },
      'IN': { state: 'IN', rate: 0.07, name: 'Indiana' },
      'IA': { state: 'IA', rate: 0.06, name: 'Iowa' },
      'KS': { state: 'KS', rate: 0.065, name: 'Kansas' },
      'KY': { state: 'KY', rate: 0.06, name: 'Kentucky' },
      'LA': { state: 'LA', rate: 0.0445, name: 'Louisiana' },
      'ME': { state: 'ME', rate: 0.055, name: 'Maine' },
      'MD': { state: 'MD', rate: 0.06, name: 'Maryland' },
      'MA': { state: 'MA', rate: 0.0625, name: 'Massachusetts' },
      'MI': { state: 'MI', rate: 0.06, name: 'Michigan' },
      'MN': { state: 'MN', rate: 0.06875, name: 'Minnesota' },
      'MS': { state: 'MS', rate: 0.07, name: 'Mississippi' },
      'MO': { state: 'MO', rate: 0.04225, name: 'Missouri' },
      'MT': { state: 'MT', rate: 0.00, name: 'Montana' },
      'NE': { state: 'NE', rate: 0.055, name: 'Nebraska' },
      'NV': { state: 'NV', rate: 0.0685, name: 'Nevada' },
      'NH': { state: 'NH', rate: 0.00, name: 'New Hampshire' },
      'NJ': { state: 'NJ', rate: 0.06625, name: 'New Jersey' },
      'NM': { state: 'NM', rate: 0.05125, name: 'New Mexico' },
      'NY': { state: 'NY', rate: 0.085, name: 'New York' },
      'NC': { state: 'NC', rate: 0.0475, name: 'North Carolina' },
      'ND': { state: 'ND', rate: 0.05, name: 'North Dakota' },
      'OH': { state: 'OH', rate: 0.0575, name: 'Ohio' },
      'OK': { state: 'OK', rate: 0.045, name: 'Oklahoma' },
      'OR': { state: 'OR', rate: 0.00, name: 'Oregon' },
      'PA': { state: 'PA', rate: 0.06, name: 'Pennsylvania' },
      'RI': { state: 'RI', rate: 0.07, name: 'Rhode Island' },
      'SC': { state: 'SC', rate: 0.06, name: 'South Carolina' },
      'SD': { state: 'SD', rate: 0.045, name: 'South Dakota' },
      'TN': { state: 'TN', rate: 0.07, name: 'Tennessee' },
      'TX': { state: 'TX', rate: 0.0625, name: 'Texas' },
      'UT': { state: 'UT', rate: 0.061, name: 'Utah' },
      'VT': { state: 'VT', rate: 0.06, name: 'Vermont' },
      'VA': { state: 'VA', rate: 0.053, name: 'Virginia' },
      'WA': { state: 'WA', rate: 0.065, name: 'Washington' },
      'WV': { state: 'WV', rate: 0.06, name: 'West Virginia' },
      'WI': { state: 'WI', rate: 0.05, name: 'Wisconsin' },
      'WY': { state: 'WY', rate: 0.04, name: 'Wyoming' }
    };

    // Get tax rate for the state
    const stateTaxRate = taxRates[body.address.state.toUpperCase()];
    
    if (!stateTaxRate) {
      return NextResponse.json(
        { error: 'Invalid state or tax rate not available' },
        { status: 400 }
      );
    }

    // Calculate taxable amount (subtotal + shipping)
    const taxableAmount = body.subtotal + (body.shipping || 0);
    
    // Calculate tax amount
    const taxAmount = taxableAmount * stateTaxRate.rate;
    
    // Calculate total
    const total = taxableAmount + taxAmount;

    // Additional tax considerations
    let additionalTaxes = 0;
    const taxBreakdown = [
      {
        type: 'state_sales_tax',
        rate: stateTaxRate.rate,
        amount: taxAmount,
        description: `${stateTaxRate.name} State Sales Tax`
      }
    ];

    // Local tax rates (simplified - in production, use ZIP code lookup)
    const localTaxRates: { [key: string]: number } = {
      '10001': 0.00875, // New York City
      '90001': 0.095,   // Los Angeles
      '60601': 0.1025,  // Chicago
      '77001': 0.0825,  // Houston
      '33101': 0.07,    // Miami
    };

    const localTaxRate = localTaxRates[body.address.zipCode];
    if (localTaxRate) {
      const localTaxAmount = taxableAmount * localTaxRate;
      additionalTaxes += localTaxAmount;
      taxBreakdown.push({
        type: 'local_tax',
        rate: localTaxRate,
        amount: localTaxAmount,
        description: 'Local Sales Tax'
      });
    }

    // Special tax exemptions for certain items (books, food, etc.)
    if (body.items) {
      const exemptItems = body.items.filter(item => 
        item.category === 'books' || item.category === 'food'
      );
      
      if (exemptItems.length > 0) {
        const exemptAmount = exemptItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const exemptTax = exemptAmount * stateTaxRate.rate;
        additionalTaxes -= exemptTax;
        
        taxBreakdown.push({
          type: 'exemption',
          rate: -stateTaxRate.rate,
          amount: -exemptTax,
          description: 'Tax Exemption (Books/Food)'
        });
      }
    }

    // Final calculations
    const finalTaxAmount = taxAmount + additionalTaxes;
    const finalTotal = taxableAmount + finalTaxAmount;

    return NextResponse.json({
      success: true,
      taxRate: stateTaxRate.rate,
      taxAmount: Math.round(finalTaxAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      total: Math.round(finalTotal * 100) / 100,
      breakdown: taxBreakdown,
      state: stateTaxRate.name,
      localTaxRate: localTaxRate || 0,
      additionalTaxes: Math.round(additionalTaxes * 100) / 100,
      subtotal: body.subtotal,
      shipping: body.shipping || 0
    });

  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
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