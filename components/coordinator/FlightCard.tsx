'use client';

import { useState, useEffect } from 'react';
import type { AvailableFlight, BookingDetail } from '@/lib/types';

interface FlightCardProps {
  flight: AvailableFlight;
  onUpdate: () => void;
}

export default function FlightCard({ flight, onUpdate }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && bookings.length === 0) {
      fetchBookings();
    }
  }, [expanded]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/flights/${flight.id}/bookings`);
      const data = await response.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/check-in`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchBookings();
        onUpdate();
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = () => {
    if (flight.availability_level === 'full') return 'bg-red-100 border-red-300';
    if (flight.current_passengers === 0) return 'bg-gray-100 border-gray-300';
    if (flight.availability_level === 'low') return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const weightPercentage = (flight.current_weight_kg / flight.max_weight_kg) * 100;

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${getStatusColor()}`}>
      {/* Flight Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gray-800">
                {formatTime(flight.scheduled_time)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {flight.route_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {flight.origin} → {flight.destination} • {flight.duration_minutes} min
                </p>
              </div>
            </div>
          </div>

          {/* Capacity Indicators */}
          <div className="flex items-center gap-6">
            {/* Passengers */}
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Passengers</p>
              <div className="flex gap-1">
                {[...Array(flight.max_passengers)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${
                      i < flight.current_passengers ? '' : 'opacity-20'
                    }`}
                  >
                    👤
                  </span>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-800 mt-1">
                {flight.current_passengers}/{flight.max_passengers}
              </p>
            </div>

            {/* Weight Gauge */}
            <div className="text-center w-32">
              <p className="text-xs text-gray-600 mb-1">Weight</p>
              <div className="relative">
                <svg className="w-full h-20" viewBox="0 0 100 50">
                  {/* Background arc */}
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  {/* Progress arc */}
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke={
                      weightPercentage > 90
                        ? '#EF4444'
                        : weightPercentage > 70
                        ? '#F59E0B'
                        : '#10B981'
                    }
                    strokeWidth="8"
                    strokeDasharray={`${(weightPercentage / 100) * 125.6} 125.6`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm font-bold text-gray-800">
                    {Math.round(flight.current_weight_kg)}kg
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                {Math.round(flight.remaining_weight_kg)}kg left
              </p>
            </div>

            {/* Expand Icon */}
            <div className="text-gray-400">
              <span className="text-2xl">
                {expanded ? '▼' : '▶'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content - Passenger Manifest */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Passenger Manifest
          </h4>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-2xl mb-2">✈️</p>
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.customer_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.booking_reference}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.customer_email} • {booking.customer_phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'checked_in'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          className="px-3 py-1 bg-primary-600 text-white rounded text-xs font-medium hover:bg-primary-700"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Passenger List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {booking.passengers.map((passenger: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded p-2 text-sm"
                      >
                        <p className="font-medium text-gray-800">
                          {passenger.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {passenger.weight_kg}kg
                          {passenger.seat_number && ` • Seat ${passenger.seat_number}`}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                    <span className="text-gray-600">
                      Total: {booking.passenger_count} passenger(s)
                    </span>
                    <span className="font-semibold text-gray-800">
                      {booking.total_weight_kg}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
