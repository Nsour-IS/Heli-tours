import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { PassengerInput, Flight } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flight_id, passengers } = body as {
      flight_id: string;
      passengers: PassengerInput[];
    };

    // Validate input
    if (!flight_id || !passengers || passengers.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch current flight data
    const { data: flight, error: flightError } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flight_id)
      .single();

    if (flightError || !flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    const typedFlight = flight as Flight;

    // Calculate total weight from passengers
    const totalNewWeight = passengers.reduce(
      (sum, p) => sum + (parseFloat(String(p.weight_kg)) || 0),
      0
    );
    const passengerCount = passengers.length;

    // Validation logic
    const currentPassengers = typedFlight.current_passengers;
    const currentWeight = parseFloat(String(typedFlight.current_weight_kg));
    const maxPassengers = typedFlight.max_passengers;
    const maxWeight = parseFloat(String(typedFlight.max_weight_kg));

    // Check passenger count limit
    if (currentPassengers + passengerCount > maxPassengers) {
      return NextResponse.json({
        canBook: false,
        reason: 'passenger_limit',
        message: `Not enough seats available. ${maxPassengers - currentPassengers} seat(s) remaining.`,
        remainingSeats: maxPassengers - currentPassengers,
      });
    }

    // Check weight limit
    if (currentWeight + totalNewWeight > maxWeight) {
      return NextResponse.json({
        canBook: false,
        reason: 'weight_limit',
        message: `Total weight exceeds flight capacity. ${(maxWeight - currentWeight).toFixed(1)}kg available.`,
        remainingCapacity: maxWeight - currentWeight,
        requestedWeight: totalNewWeight,
      });
    }

    // Booking can be accommodated
    return NextResponse.json({
      canBook: true,
      remainingSeats: maxPassengers - currentPassengers - passengerCount,
      remainingWeight: maxWeight - currentWeight - totalNewWeight,
      message: 'Booking can be accommodated',
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
