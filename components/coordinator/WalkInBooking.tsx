'use client';

import { useState, useEffect } from 'react';
import type { AvailableFlight, PassengerInput } from '@/lib/types';

export default function WalkInBooking() {
  const [flights, setFlights] = useState<AvailableFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    { name: '', weight_kg: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState('');

  useEffect(() => {
    fetchTodayFlights();
  }, []);

  const fetchTodayFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      if (data.flights) {
        // Filter for today's flights with availability
        const today = new Date().toISOString().split('T')[0];
        const todayFlights = data.flights.filter(
          (f: AvailableFlight) =>
            f.scheduled_date === today && f.remaining_seats > 0
        );
        setFlights(todayFlights);
      }
    } catch (error) {
      console.error('Failed to fetch flights:', error);
    }
  };

  const handlePassengerCountChange = (count: number) => {
    setPassengerCount(count);
    const newPassengers = Array.from({ length: count }, (_, i) => ({
      name: passengers[i]?.name || '',
      weight_kg: passengers[i]?.weight_kg || 0,
    }));
    setPassengers(newPassengers);
  };

  const updatePassenger = (
    index: number,
    field: keyof PassengerInput,
    value: any
  ) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const totalWeight = passengers.reduce(
        (sum, p) => sum + (parseFloat(String(p.weight_kg)) || 0),
        0
      );

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_id: selectedFlight,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          passengers,
          total_weight_kg: totalWeight,
        }),
      });

      const result = await response.json();

      if (response.ok && result.booking) {
        setSuccess(true);
        setBookingReference(result.booking.booking_reference);
        // Reset form
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setPassengerCount(1);
    setPassengers([{ name: '', weight_kg: 0 }]);
    setSelectedFlight('');
    setSuccess(false);
    setError(null);
    fetchTodayFlights();
  };

  const selectedFlightData = flights.find((f) => f.id === selectedFlight);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Walk-In Booking
          </h2>
          <p className="text-gray-600 mt-1">
            Quick booking for customers at the helipad
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Created!
            </h3>
            <p className="text-gray-600 mb-4">
              Reference: <strong>{bookingReference}</strong>
            </p>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Another Booking
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Flight Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Flight
              </label>
              <select
                value={selectedFlight}
                onChange={(e) => setSelectedFlight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">-- Select a flight --</option>
                {flights.map((flight) => (
                  <option key={flight.id} value={flight.id}>
                    {flight.scheduled_time.slice(0, 5)} - {flight.route_name} (
                    {flight.remaining_seats} seats, {Math.round(flight.remaining_weight_kg)}
                    kg available)
                  </option>
                ))}
              </select>
            </div>

            {selectedFlightData && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Flight Capacity:</strong> {selectedFlightData.remaining_seats}{' '}
                  seats, {Math.round(selectedFlightData.remaining_weight_kg)}kg available
                </p>
              </div>
            )}

            {/* Number of Passengers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Passengers
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handlePassengerCountChange(count)}
                    disabled={
                      selectedFlightData &&
                      count > selectedFlightData.remaining_seats
                    }
                    className={`px-6 py-3 rounded-lg border font-medium transition-colors ${
                      passengerCount === count
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Passenger Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Passenger Information
              </label>
              <div className="space-y-3">
                {passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Passenger {index + 1} Name
                      </label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) =>
                          updatePassenger(index, 'name', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={passenger.weight_kg || ''}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'weight_kg',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="20"
                        max="200"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contact Information
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedFlight}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Booking...' : 'Create Walk-In Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
