import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flight_id, passenger_count, session_id } = body;

    if (!flight_id || !passenger_count || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Clean up expired holds first
    await supabaseAdmin.rpc('cleanup_expired_holds');

    // Check if flight has enough actual available seats
    const { data: availabilityData } = await supabaseAdmin.rpc(
      'get_flight_available_seats',
      { p_flight_id: flight_id }
    );

    if (availabilityData && availabilityData[0]) {
      const { actual_available } = availabilityData[0];

      if (actual_available < passenger_count) {
        return NextResponse.json(
          {
            error: 'Not enough seats available',
            actual_available,
          },
          { status: 400 }
        );
      }
    }

    // Delete any existing hold for this session on this flight
    await supabaseAdmin
      .from('flight_holds')
      .delete()
      .eq('flight_id', flight_id)
      .eq('session_id', session_id);

    // Create new hold (expires in 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const { data: hold, error } = await supabaseAdmin
      .from('flight_holds')
      .insert({
        flight_id,
        session_id,
        passenger_count,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Hold creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create hold' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hold,
      expires_in_seconds: 15 * 60,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
