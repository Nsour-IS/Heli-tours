'use client';

import { useState, useEffect } from 'react';
import FlightCard from './FlightCard';
import type { AvailableFlight } from '@/lib/types';

export default function TodaysFlights() {
  const [flights, setFlights] = useState<AvailableFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchFlights();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchFlights();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flights');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setFlights(data.flights);
        // Default to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
      }
    } catch (err) {
      setError('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const uniqueDates = Array.from(
    new Set(flights.map((f) => f.scheduled_date))
  ).sort();

  const filteredFlights = selectedDate
    ? flights.filter((f) => f.scheduled_date === selectedDate)
    : flights;

  const todayFlights = filteredFlights.filter(
    (f) => f.scheduled_date === new Date().toISOString().split('T')[0]
  );

  const stats = {
    total: todayFlights.length,
    confirmed: todayFlights.filter((f) => f.current_passengers > 0).length,
    empty: todayFlights.filter((f) => f.current_passengers === 0).length,
    full: todayFlights.filter((f) => f.availability_level === 'full').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Flights</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-4xl">🚁</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Bookings</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empty</p>
              <p className="text-3xl font-bold text-gray-600">{stats.empty}</p>
            </div>
            <div className="text-4xl">○</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fully Booked</p>
              <p className="text-3xl font-bold text-red-600">{stats.full}</p>
            </div>
            <div className="text-4xl">🔒</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="flex gap-2">
              {uniqueDates.slice(0, 7).map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                    selectedDate === date
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Flights Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Flight Schedule -{' '}
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h2>

        {filteredFlights.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No flights scheduled for this date
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onUpdate={handleRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
