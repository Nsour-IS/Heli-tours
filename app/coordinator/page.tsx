'use client';

import { useState } from 'react';
import TodaysFlights from '@/components/coordinator/TodaysFlights';
import WalkInBooking from '@/components/coordinator/WalkInBooking';
import Analytics from '@/components/coordinator/Analytics';

type TabType = 'flights' | 'walkin' | 'analytics';

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('flights');

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Coordinator Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage flights, bookings, and walk-in customers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('flights')}
                className={`${
                  activeTab === 'flights'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                📅 Today's Flights
              </button>
              <button
                onClick={() => setActiveTab('walkin')}
                className={`${
                  activeTab === 'walkin'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                ➕ Walk-In Booking
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                📊 Analytics
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'flights' && <TodaysFlights />}
        {activeTab === 'walkin' && <WalkInBooking />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </main>
  );
}
