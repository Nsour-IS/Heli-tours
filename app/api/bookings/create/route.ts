import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { BookingFormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      flight_id,
      customer_name,
      customer_email,
      customer_phone,
      passengers,
      total_weight_kg,
    } = body as BookingFormData & { total_weight_kg: number };

    // Validate input
    if (
      !flight_id ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !passengers ||
      passengers.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for insertion
    // First, validate the flight can still accommodate the booking
    const { data: flight, error: flightError } = await supabaseAdmin
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

    const totalWeight = total_weight_kg || passengers.reduce((sum, p) => sum + p.weight_kg, 0);

    // Final validation
    if (
      flight.current_passengers + passengers.length > flight.max_passengers ||
      flight.current_weight_kg + totalWeight > flight.max_weight_kg
    ) {
      return NextResponse.json(
        { error: 'Flight capacity exceeded. Please select another flight.' },
        { status: 400 }
      );
    }

    // Generate booking reference
    const { data: refData } = await supabaseAdmin.rpc('generate_booking_reference');
    const bookingReference = refData || `HT-${Date.now()}`;

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        flight_id,
        booking_reference: bookingReference,
        customer_name,
        customer_email,
        customer_phone,
        passenger_count: passengers.length,
        total_weight_kg: totalWeight,
        booking_type: 'online',
        payment_status: 'pending',
        status: 'pending',
        qr_code: `QR-${bookingReference}`,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Create passenger records
    const passengerRecords = passengers.map((p) => ({
      booking_id: booking.id,
      name: p.name,
      weight_kg: p.weight_kg,
    }));

    const { error: passengersError } = await supabaseAdmin
      .from('passengers')
      .insert(passengerRecords);

    if (passengersError) {
      console.error('Passengers creation error:', passengersError);
      // Rollback booking
      await supabaseAdmin.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Failed to create passenger records' },
        { status: 500 }
      );
    }

    // Return booking details
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        qr_code: booking.qr_code,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
