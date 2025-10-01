import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await context.params;

    if (!reference) {
      return NextResponse.json(
        { error: 'Booking reference required' },
        { status: 400 }
      );
    }

    // Fetch booking with all related data
    const { data, error } = await supabase
      .from('booking_details')
      .select('*')
      .eq('booking_reference', reference)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
