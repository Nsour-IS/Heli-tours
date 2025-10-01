import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Update booking status to checked_in
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'checked_in' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Check-in error:', error);
      return NextResponse.json(
        { error: 'Failed to check in booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
