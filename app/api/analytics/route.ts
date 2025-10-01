import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'today':
      default:
        startDate = new Date(now.toISOString().split('T')[0]);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    // Fetch flights in date range
    const { data: flights, error: flightsError } = await supabaseAdmin
      .from('flights')
      .select('*')
      .gte('scheduled_date', startDateStr)
      .order('scheduled_date', { ascending: true });

    if (flightsError) {
      console.error('Flights fetch error:', flightsError);
      return NextResponse.json(
        { error: 'Failed to fetch flights' },
        { status: 500 }
      );
    }

    // Fetch bookings in date range
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*, flights!inner(scheduled_date, scheduled_time, route_id, routes!inner(base_price))')
      .gte('flights.scheduled_date', startDateStr)
      .neq('status', 'cancelled');

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const totalFlights = flights?.length || 0;
    const totalBookings = bookings?.length || 0;
    const totalPassengers =
      bookings?.reduce((sum, b) => sum + b.passenger_count, 0) || 0;

    // Calculate revenue (simplified - assuming base_price per passenger)
    const totalRevenue =
      bookings?.reduce((sum, b: any) => {
        const price = b.flights?.routes?.base_price || 0;
        return sum + price * b.passenger_count;
      }, 0) || 0;

    // Calculate utilization
    const flightsWithBookings = flights?.filter((f) => f.current_passengers > 0) || [];
    const avgSeatUtilization =
      flightsWithBookings.length > 0
        ? (flightsWithBookings.reduce(
            (sum, f) => sum + (f.current_passengers / f.max_passengers) * 100,
            0
          ) /
            flightsWithBookings.length) ||
          0
        : 0;

    const avgWeightUtilization =
      flightsWithBookings.length > 0
        ? (flightsWithBookings.reduce(
            (sum, f) => sum + (f.current_weight_kg / f.max_weight_kg) * 100,
            0
          ) /
            flightsWithBookings.length) ||
          0
        : 0;

    // Booking types
    const bookingsByType = {
      online: bookings?.filter((b) => b.booking_type === 'online').length || 0,
      phone: bookings?.filter((b) => b.booking_type === 'phone').length || 0,
      walkin: bookings?.filter((b) => b.booking_type === 'walkin').length || 0,
    };

    // Popular time slots
    const timeSlotCounts: Record<string, number> = {};
    bookings?.forEach((booking: any) => {
      const time = booking.flights?.scheduled_time?.slice(0, 5) || '';
      if (time) {
        timeSlotCounts[time] = (timeSlotCounts[time] || 0) + 1;
      }
    });

    const popularTimeSlots = Object.entries(timeSlotCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      data: {
        totalFlights,
        totalBookings,
        totalPassengers,
        totalRevenue: Math.round(totalRevenue),
        avgSeatUtilization,
        avgWeightUtilization,
        bookingsByType,
        popularTimeSlots,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
