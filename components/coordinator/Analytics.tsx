'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalFlights: number;
  totalBookings: number;
  totalPassengers: number;
  totalRevenue: number;
  avgSeatUtilization: number;
  avgWeightUtilization: number;
  bookingsByType: { online: number; phone: number; walkin: number };
  popularTimeSlots: Array<{ time: string; count: number }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-center text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Metrics
          </h2>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  dateRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Flights</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.totalFlights}
              </p>
            </div>
            <div className="text-4xl">🚁</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.totalBookings}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Passengers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.totalPassengers}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${data.totalRevenue}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Utilization Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Seat Utilization
          </h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                  Target: 85%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary-600">
                  {data.avgSeatUtilization.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-primary-200">
              <div
                style={{ width: `${Math.min(data.avgSeatUtilization, 100)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  data.avgSeatUtilization >= 85
                    ? 'bg-green-500'
                    : data.avgSeatUtilization >= 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {data.avgSeatUtilization >= 85
              ? '✓ Excellent utilization!'
              : data.avgSeatUtilization >= 70
              ? '⚠️ Good, but can improve'
              : '⚠️ Low utilization'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weight Utilization
          </h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                  Average Usage
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary-600">
                  {data.avgWeightUtilization.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-primary-200">
              <div
                style={{ width: `${Math.min(data.avgWeightUtilization, 100)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Shows how efficiently weight capacity is being used
          </p>
        </div>
      </div>

      {/* Booking Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Booking Sources
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl mb-2">💻</div>
            <p className="text-2xl font-bold text-gray-900">
              {data.bookingsByType.online}
            </p>
            <p className="text-sm text-gray-600">Online</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📞</div>
            <p className="text-2xl font-bold text-gray-900">
              {data.bookingsByType.phone}
            </p>
            <p className="text-sm text-gray-600">Phone</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🚶</div>
            <p className="text-2xl font-bold text-gray-900">
              {data.bookingsByType.walkin}
            </p>
            <p className="text-sm text-gray-600">Walk-In</p>
          </div>
        </div>
      </div>

      {/* Popular Time Slots */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Popular Time Slots
        </h3>
        <div className="space-y-3">
          {data.popularTimeSlots.map((slot, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm font-medium text-gray-700">
                {slot.time}
              </div>
              <div className="flex-1 mx-4">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600"
                    style={{
                      width: `${
                        (slot.count / Math.max(...data.popularTimeSlots.map((s) => s.count))) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-right text-sm font-semibold text-gray-900">
                {slot.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
