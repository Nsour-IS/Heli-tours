'use client';

import { useState } from 'react';
import type { AvailableFlight, PassengerInput } from '@/lib/types';

interface PassengerFormProps {
  flight: AvailableFlight;
  initialPassengerCount?: number;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export default function PassengerForm({
  flight,
  initialPassengerCount = 1,
  onBack,
  onSubmit,
}: PassengerFormProps) {
  const [passengerCount, setPassengerCount] = useState(initialPassengerCount);
  const [passengers, setPassengers] = useState<PassengerInput[]>(
    Array.from({ length: initialPassengerCount }, () => ({ name: '', weight_kg: 0 }))
  );
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handlePassengerCountChange = (count: number) => {
    setPassengerCount(count);
    const newPassengers = Array.from({ length: count }, (_, i) => ({
      name: passengers[i]?.name || '',
      weight_kg: passengers[i]?.weight_kg || 0,
    }));
    setPassengers(newPassengers);
    setValidationError(null);
  };

  const updatePassenger = (index: number, field: keyof PassengerInput, value: any) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
    setValidationError(null);
  };

  const calculateTotalWeight = () => {
    return passengers.reduce((sum, p) => sum + (parseFloat(String(p.weight_kg)) || 0), 0);
  };

  const validateWeights = async () => {
    setValidating(true);
    setValidationError(null);

    try {
      const totalWeight = calculateTotalWeight();

      // Client-side validation
      if (totalWeight === 0) {
        setValidationError('Please enter weights for all passengers');
        setValidating(false);
        return false;
      }

      if (passengers.some((p) => !p.name.trim())) {
        setValidationError('Please enter names for all passengers');
        setValidating(false);
        return false;
      }

      if (passengers.some((p) => p.weight_kg < 20 || p.weight_kg > 200)) {
        setValidationError('Passenger weight must be between 20kg and 200kg');
        setValidating(false);
        return false;
      }

      // Server-side validation
      const response = await fetch('/api/bookings/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_id: flight.id,
          passengers,
        }),
      });

      const result = await response.json();

      if (!result.canBook) {
        if (result.reason === 'weight_limit') {
          setValidationError(
            `Total weight (${totalWeight.toFixed(1)}kg) exceeds available capacity (${result.remainingCapacity?.toFixed(1)}kg)`
          );
        } else if (result.reason === 'passenger_limit') {
          setValidationError('Not enough seats available for this booking');
        } else {
          setValidationError(result.message || 'This flight cannot accommodate your booking');
        }
        setValidating(false);
        return false;
      }

      setValidating(false);
      return true;
    } catch (error) {
      setValidationError('Failed to validate booking. Please try again.');
      setValidating(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !customerPhone) {
      setValidationError('Please fill in all contact information');
      return;
    }

    const isValid = await validateWeights();
    if (isValid) {
      onSubmit({
        flight_id: flight.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        passengers,
      });
    }
  };

  const totalWeight = calculateTotalWeight();
  const weightPercentage = (totalWeight / flight.remaining_weight_kg) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Passenger Details
      </h2>

      {/* Flight Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-primary-800">{flight.route_name}</h3>
            <p className="text-sm text-primary-600 mt-1">
              {new Date(flight.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {flight.scheduled_time.slice(0, 5)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-600">Available Capacity</p>
            <p className="font-semibold text-primary-800">
              {flight.remaining_seats} seats, {Math.round(flight.remaining_weight_kg)}kg
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                disabled={count > flight.remaining_seats}
                className={`px-6 py-3 rounded-lg border font-medium transition-colors ${
                  passengerCount === count
                    ? 'bg-primary-600 text-white border-primary-600'
                    : count > flight.remaining_seats
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                {count} {count === 1 ? 'Person' : 'People'}
              </button>
            ))}
          </div>
        </div>

        {/* Passenger Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Passenger Information
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              🔒 <strong>Privacy Notice:</strong> Weight information is used solely for
              safety calculations and is never shared or displayed publicly.
            </p>
          </div>

          <div className="space-y-4">
            {passengers.map((passenger, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-700 mb-3">
                  Passenger {index + 1}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) =>
                        updatePassenger(index, 'name', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="70"
                      min="20"
                      max="200"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Total Weight:</span>
            <span className="text-xl font-bold text-gray-900">
              {totalWeight.toFixed(1)} kg
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                weightPercentage > 100
                  ? 'bg-red-600'
                  : weightPercentage > 80
                  ? 'bg-yellow-500'
                  : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(weightPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Available: {Math.round(flight.remaining_weight_kg)}kg | Used:{' '}
            {totalWeight > 0 ? totalWeight.toFixed(1) : 0}kg | Remaining:{' '}
            {Math.max(0, flight.remaining_weight_kg - totalWeight).toFixed(1)}kg
          </p>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+962 7X XXX XXXX"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{validationError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={validating}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {validating ? 'Validating...' : 'Continue to Confirmation'}
          </button>
        </div>
      </form>
    </div>
  );
}
