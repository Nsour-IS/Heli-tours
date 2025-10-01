'use client';

import { useState, useEffect } from 'react';
import type { AvailableFlight } from '@/lib/types';
import FlightSelector from '@/components/FlightSelector';
import PassengerForm from '@/components/PassengerForm';
import BookingSummary from '@/components/BookingSummary';

// Generate session ID for holds
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('booking_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('booking_session_id', sessionId);
  }
  return sessionId;
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedFlight, setSelectedFlight] = useState<AvailableFlight | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengerData, setPassengerData] = useState<any>(null);
  const [holdId, setHoldId] = useState<string | null>(null);

  // Clean up hold when leaving the page
  useEffect(() => {
    return () => {
      if (holdId) {
        releaseHold();
      }
    };
  }, [holdId]);

  const createHold = async (flightId: string, count: number) => {
    try {
      const response = await fetch('/api/holds/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_id: flightId,
          passenger_count: count,
          session_id: getSessionId(),
        }),
      });

      const result = await response.json();
      if (result.success && result.hold) {
        setHoldId(result.hold.id);
      }
    } catch (error) {
      console.error('Failed to create hold:', error);
    }
  };

  const releaseHold = async () => {
    try {
      await fetch('/api/holds/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: getSessionId(),
        }),
      });
      setHoldId(null);
    } catch (error) {
      console.error('Failed to release hold:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <div className="bg-primary-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Book Your Flight</h1>
          <p className="text-primary-100 mt-2">
            Experience Amman from the sky
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Select Flight</span>
            </div>

            <div className="w-16 h-1 bg-gray-300"></div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 2
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Passenger Details</span>
            </div>

            <div className="w-16 h-1 bg-gray-300"></div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= 3
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <FlightSelector
              onSelect={async (flight, count) => {
                setSelectedFlight(flight);
                setPassengerCount(count);
                await createHold(flight.id, count);
                setStep(2);
              }}
            />
          )}

          {step === 2 && selectedFlight && (
            <PassengerForm
              flight={selectedFlight}
              initialPassengerCount={passengerCount}
              onBack={async () => {
                await releaseHold();
                setStep(1);
              }}
              onSubmit={async (data) => {
                setPassengerData(data);
                await releaseHold();
                setStep(3);
              }}
            />
          )}

          {step === 3 && selectedFlight && passengerData && (
            <BookingSummary
              flight={selectedFlight}
              passengerData={passengerData}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
