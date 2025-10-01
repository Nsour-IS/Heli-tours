'use client';

import { useState, useEffect } from 'react';
import type { AvailableFlight } from '@/lib/types';

interface FlightSelectorProps {
  onSelect: (flight: AvailableFlight) => void;
}

export default function FlightSelector({ onSelect }: FlightSelectorProps) {
  const [flights, setFlights] = useState<AvailableFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flights');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setFlights(data.flights);
        // Set default to today's date
        if (data.flights.length > 0) {
          setSelectedDate(data.flights[0].scheduled_date);
        }
      }
    } catch (err) {
      setError('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const uniqueDates = Array.from(
    new Set(flights.map((f) => f.scheduled_date))
  ).sort();

  const filteredFlights = selectedDate
    ? flights.filter((f) => f.scheduled_date === selectedDate)
    : flights;

  const getAvailabilityBadge = (flight: AvailableFlight) => {
    const { availability_level } = flight;
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-300',
      low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      full: 'bg-red-100 text-red-800 border-red-300',
      none: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    const labels = {
      high: 'Available',
      low: 'Limited',
      full: 'Full',
      none: 'Unavailable',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[availability_level]}`}
      >
        {labels[availability_level]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Select Your Flight
      </h2>

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div className="flex gap-2 flex-wrap">
          {uniqueDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                selectedDate === date
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Flight List */}
      <div className="space-y-4">
        {filteredFlights.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No flights available for this date.
          </p>
        ) : (
          filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-primary-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Route Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {flight.route_name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {flight.origin} → {flight.destination}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>⏱️ {flight.duration_minutes} minutes</span>
                      <span>💰 ${flight.base_price} per person</span>
                    </div>
                  </div>

                  {/* Time and Availability */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Departure Time</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatTime(flight.scheduled_time)}
                      </p>
                    </div>

                    <div className="border-l border-gray-300 pl-6">
                      <p className="text-sm text-gray-500">Seats Available</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {flight.remaining_seats} / {flight.max_passengers}
                      </p>
                    </div>

                    <div className="border-l border-gray-300 pl-6">
                      <p className="text-sm text-gray-500">Weight Capacity</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {Math.round(flight.remaining_weight_kg)} kg remaining
                      </p>
                      <div className="mt-1 w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ((flight.max_weight_kg - flight.remaining_weight_kg) /
                                flight.max_weight_kg) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="ml-6 flex flex-col items-end gap-3">
                  {getAvailabilityBadge(flight)}
                  <button
                    onClick={() => onSelect(flight)}
                    disabled={
                      flight.availability_level === 'full' ||
                      flight.remaining_seats === 0
                    }
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      flight.availability_level === 'full' ||
                      flight.remaining_seats === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {flight.remaining_seats === 0 ? 'Fully Booked' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
