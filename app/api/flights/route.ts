import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AvailableFlight } from '@/lib/types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('available_flights')
      .select('*')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flights' },
        { status: 500 }
      );
    }

    return NextResponse.json({ flights: data as AvailableFlight[] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
