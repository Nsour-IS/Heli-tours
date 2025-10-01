'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import type { BookingDetail } from '@/lib/types';

export default function BookingConfirmationPage() {
  const params = useParams();
  const reference = params.reference as string;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reference) {
      fetchBooking();
    }
  }, [reference]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/by-reference/${reference}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBooking(data.booking);
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(data.booking.booking_reference, {
          width: 300,
          margin: 2,
        });
        setQrCodeUrl(qrUrl);
      }
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading booking details...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Booking Not Found
              </h1>
              <p className="text-gray-600 mb-6">{error || 'Invalid booking reference'}</p>
              <Link
                href="/book"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Make a New Booking
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Your helicopter tour has been successfully booked.
            </p>
            <div className="mt-6 inline-block bg-primary-50 border-2 border-primary-600 rounded-lg px-6 py-3">
              <p className="text-sm text-primary-600 font-medium mb-1">
                Booking Reference
              </p>
              <p className="text-2xl font-bold text-primary-800">
                {booking.booking_reference}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Your Boarding Pass
            </h2>
            {qrCodeUrl && (
              <div className="inline-block bg-white p-4 border-2 border-gray-200 rounded-lg">
                <img src={qrCodeUrl} alt="Booking QR Code" className="mx-auto" />
              </div>
            )}
            <p className="text-sm text-gray-600 mt-4">
              Present this QR code at check-in
            </p>
          </div>

          {/* Flight Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Flight Details
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600 mb-1">Route</p>
                <p className="text-lg font-semibold text-gray-800">
                  {booking.route_name}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.origin} → {booking.destination}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(booking.scheduled_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Departure Time</p>
                  <p className="font-semibold text-gray-800">
                    {formatTime(booking.scheduled_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-800">
                    {booking.duration_minutes} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Passengers</p>
                  <p className="font-semibold text-gray-800">
                    {booking.passenger_count}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger List */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Passenger List
            </h2>
            <div className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{passenger.name}</p>
                    <p className="text-sm text-gray-600">Passenger {index + 1}</p>
                  </div>
                  {passenger.seat_number && (
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        Seat {passenger.seat_number}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Contact Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-800">
                  {booking.customer_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold text-gray-800">
                  {booking.customer_email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-800">
                  {booking.customer_phone}
                </span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-3">
              Important Information
            </h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Please arrive <strong>30 minutes before</strong> your scheduled
                  departure time
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Bring a <strong>valid ID</strong> for all passengers
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Present your <strong>QR code</strong> at check-in
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  A confirmation email has been sent to{' '}
                  <strong>{booking.customer_email}</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Print Confirmation
            </button>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium text-center hover:bg-primary-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
