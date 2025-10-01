import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Fetch all bookings for this flight
    const { data, error } = await supabaseAdmin
      .from('booking_details')
      .select('*')
      .eq('flight_id', id)
      .neq('booking_status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch bookings error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
