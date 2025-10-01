import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Helicopter Tours Amman
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8">
            Experience breathtaking aerial views of Jordan's capital
          </p>
          <Link
            href="/book"
            className="inline-block px-8 py-4 bg-gold-500 text-white rounded-lg font-bold text-lg hover:bg-gold-600 transition-colors shadow-lg"
          >
            Book Your Flight
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🚁</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Scenic Routes
            </h3>
            <p className="text-gray-600">
              Fly over Amman, Madaba, and the stunning Jordan Valley
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Smart Booking
            </h3>
            <p className="text-gray-600">
              Weight-optimized system ensures safe and efficient flights
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Quick Tours
            </h3>
            <p className="text-gray-600">
              12-minute flights perfect for experiencing the city from above
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto mt-16 bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready for an Unforgettable Experience?
          </h2>
          <p className="text-gray-600 mb-6">
            Book your helicopter tour today and see Amman like never before.
            Our smart booking system ensures optimal safety and availability.
          </p>
          <Link
            href="/book"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start Booking
          </Link>
        </div>
      </div>
    </main>
  );
}
