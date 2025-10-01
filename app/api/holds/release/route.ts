import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, flight_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Build delete query
    let query = supabaseAdmin
      .from('flight_holds')
      .delete()
      .eq('session_id', session_id);

    // Optionally filter by flight_id if provided
    if (flight_id) {
      query = query.eq('flight_id', flight_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Hold release error:', error);
      return NextResponse.json(
        { error: 'Failed to release hold' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
