'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AvailableFlight } from '@/lib/types';

interface BookingSummaryProps {
  flight: AvailableFlight;
  passengerData: any;
  onBack: () => void;
}

export default function BookingSummary({
  flight,
  passengerData,
  onBack,
}: BookingSummaryProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalWeight = passengerData.passengers.reduce(
    (sum: number, p: any) => sum + parseFloat(p.weight_kg),
    0
  );
  const totalPrice = flight.base_price * passengerData.passengers.length;

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...passengerData,
          total_weight_kg: totalWeight,
        }),
      });

      const result = await response.json();

      if (response.ok && result.booking) {
        // Redirect to confirmation page
        router.push(`/booking-confirmation/${result.booking.booking_reference}`);
      } else {
        setError(result.error || 'Failed to create booking');
        setSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Confirm Your Booking
      </h2>

      {/* Flight Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Flight Details
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Route</p>
              <p className="font-semibold text-gray-800">{flight.route_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(flight.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Departure Time</p>
              <p className="font-semibold text-gray-800">
                {flight.scheduled_time.slice(0, 5)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold text-gray-800">
                {flight.duration_minutes} minutes
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Origin</p>
              <p className="font-semibold text-gray-800">{flight.origin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-semibold text-gray-800">{flight.destination}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Passengers ({passengerData.passengers.length})
        </h3>
        <div className="space-y-2">
          {passengerData.passengers.map((passenger: any, index: number) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{passenger.name}</p>
                <p className="text-sm text-gray-600">Passenger {index + 1}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {passenger.weight_kg} kg
                </p>
                <p className="text-sm text-gray-600">
                  ${flight.base_price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Contact Information
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold text-gray-800">
                {passengerData.customer_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-800">
                {passengerData.customer_email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold text-gray-800">
                {passengerData.customer_phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Price Summary
        </h3>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">
                Base price × {passengerData.passengers.length} passenger(s)
              </span>
              <span className="font-semibold text-gray-800">
                ${flight.base_price} × {passengerData.passengers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total weight</span>
              <span className="text-sm font-semibold text-gray-700">
                {totalWeight.toFixed(1)} kg
              </span>
            </div>
            <div className="border-t border-primary-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> By confirming this booking, you agree to our
            terms and conditions. Weight limits are enforced for safety. Please
            arrive 30 minutes before departure.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleConfirmBooking}
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
