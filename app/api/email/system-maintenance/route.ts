import { NextRequest, NextResponse } from 'next/server';
import { sendSystemMaintenanceEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, maintenanceType, startTime, endTime, affectedServices } = await request.json();

    if (!email || !maintenanceType || !startTime || !endTime || !affectedServices) {
      return NextResponse.json(
        { error: 'Email, maintenanceType, startTime, endTime, and affectedServices are required' },
        { status: 400 }
      );
    }

    const result = await sendSystemMaintenanceEmail(email, maintenanceType, startTime, endTime, affectedServices);

    if (result.success) {
      return NextResponse.json(
        { message: 'System maintenance email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send system maintenance email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in system maintenance email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 