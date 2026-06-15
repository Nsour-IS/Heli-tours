# API Documentation

**Project:** Helicopter Tours Amman
**Base URL:** `/api`
**Version:** 1.0
**Last Updated:** October 17, 2025

---

## Overview

The Helicopter Tours Amman API provides RESTful endpoints for managing flight bookings, capacity validation, seat holds, and analytics. All endpoints return JSON responses.

**Core Features:**
- Flight availability checking
- Weight-based capacity validation
- Booking creation and management
- Temporary seat holds (15-minute reservation)
- Real-time analytics

---

## Authentication

**Current Implementation (MVP):**
- Public endpoints: No authentication required
- Admin endpoints: Use Supabase service role key (server-side only)

**Security Notes:**
- Row Level Security (RLS) enabled on database
- Service role key required for coordinator dashboard operations
- Customer data protected by RLS policies

**Future:**
- Supabase Auth integration
- JWT-based authentication
- Role-based access control

---

## Base Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message description",
  "status": 400
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Endpoints

### 1. Get Available Flights

Retrieves all available flights for booking.

**Endpoint:** `GET /api/flights`

**Authentication:** None (Public)

**Query Parameters:** None

**Response:**
```json
{
  "flights": [
    {
      "id": "uuid",
      "route_id": "uuid",
      "route_name": "Amman Classic Tour",
      "origin": "CitiMall Helipad",
      "destination": "Madaba & Jordan Valley View",
      "duration_minutes": 12,
      "base_price": 150.00,
      "scheduled_date": "2024-10-10",
      "scheduled_time": "09:00:00",
      "max_passengers": 3,
      "max_weight_kg": 180.00,
      "current_passengers": 1,
      "current_weight_kg": 75.00,
      "remaining_seats": 2,
      "remaining_weight_kg": 105.00,
      "held_seats": 0,
      "status": "scheduled",
      "availability_level": "high"
    }
  ]
}
```

**Availability Levels:**
- `full` - No capacity available
- `high` - 2+ seats available
- `low` - 1 seat available
- `none` - Fully booked

**Notes:**
- Only returns scheduled flights for current date and future
- Results sorted by date, then time
- Limited to 20 results
- Includes real-time capacity calculations

**Example:**
```bash
curl https://your-domain.vercel.app/api/flights
```

---

### 2. Validate Booking

Validates if a booking can be accommodated before creating it.

**Endpoint:** `POST /api/bookings/validate`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "flight_id": "uuid",
  "passengers": [
    {
      "name": "John Doe",
      "weight_kg": 75.5
    },
    {
      "name": "Jane Smith",
      "weight_kg": 62.0
    }
  ]
}
```

**Success Response (Can Book):**
```json
{
  "canBook": true,
  "remainingSeats": 1,
  "remainingWeight": 42.5,
  "message": "Booking can be accommodated"
}
```

**Failure Response (Passenger Limit):**
```json
{
  "canBook": false,
  "reason": "passenger_limit",
  "message": "Not enough seats available. 1 seat(s) remaining.",
  "remainingSeats": 1
}
```

**Failure Response (Weight Limit):**
```json
{
  "canBook": false,
  "reason": "weight_limit",
  "message": "Total weight exceeds flight capacity. 45.5kg available.",
  "remainingCapacity": 45.5,
  "requestedWeight": 137.5
}
```

**Validation Rules:**
- `passenger_count + current_passengers <= max_passengers`
- `total_weight + current_weight <= max_weight_kg`
- Individual passenger weight: 20-200kg

**Example:**
```bash
curl -X POST https://your-domain.vercel.app/api/bookings/validate \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "abc-123",
    "passengers": [
      {"name": "John Doe", "weight_kg": 75}
    ]
  }'
```

---

### 3. Create Booking

Creates a new booking with passenger details.

**Endpoint:** `POST /api/bookings/create`

**Authentication:** Admin (uses service role key)

**Request Body:**
```json
{
  "flight_id": "uuid",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+962-XXX-XXXX",
  "passengers": [
    {
      "name": "John Doe",
      "weight_kg": 75.5
    },
    {
      "name": "Jane Smith",
      "weight_kg": 62.0
    }
  ],
  "total_weight_kg": 137.5
}
```

**Success Response:**
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "booking_reference": "HT-20241002-001",
    "qr_code": "QR-HT-20241002-001"
  }
}
```

**Error Responses:**

**Missing Fields (400):**
```json
{
  "error": "Missing required fields"
}
```

**Flight Not Found (404):**
```json
{
  "error": "Flight not found"
}
```

**Capacity Exceeded (400):**
```json
{
  "error": "Flight capacity exceeded. Please select another flight."
}
```

**Process:**
1. Validates all required fields
2. Checks flight exists and has capacity
3. Generates unique booking reference (HT-YYYYMMDD-XXX)
4. Creates booking record
5. Creates passenger records
6. Triggers automatic flight capacity update
7. Returns booking reference and QR code

**Transaction Safety:**
- If passenger creation fails, booking is rolled back
- Flight capacity updated via database trigger

**Example:**
```bash
curl -X POST https://your-domain.vercel.app/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "abc-123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+962-XXX-XXXX",
    "passengers": [
      {"name": "John Doe", "weight_kg": 75}
    ],
    "total_weight_kg": 75
  }'
```

---

### 4. Get Booking by Reference

Retrieves booking details by booking reference.

**Endpoint:** `GET /api/bookings/by-reference/[reference]`

**Authentication:** None (Public, but RLS applies)

**URL Parameters:**
- `reference` - Booking reference (e.g., HT-20241002-001)

**Response:**
```json
{
  "booking_id": "uuid",
  "booking_reference": "HT-20241002-001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+962-XXX-XXXX",
  "passenger_count": 2,
  "total_weight_kg": 137.5,
  "booking_type": "online",
  "payment_status": "pending",
  "booking_status": "confirmed",
  "qr_code": "QR-HT-20241002-001",
  "booked_at": "2024-10-02T10:30:00Z",
  "flight_id": "uuid",
  "scheduled_date": "2024-10-10",
  "scheduled_time": "09:00:00",
  "route_name": "Amman Classic Tour",
  "origin": "CitiMall Helipad",
  "destination": "Madaba & Jordan Valley View",
  "duration_minutes": 12,
  "base_price": 150.00,
  "passengers": [
    {
      "name": "John Doe",
      "weight_kg": 75.5,
      "seat_number": 1
    },
    {
      "name": "Jane Smith",
      "weight_kg": 62.0,
      "seat_number": 2
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Booking not found"
}
```

**Notes:**
- Uses `booking_details` view for complete information
- Includes full flight and route details
- Returns passenger array with seat assignments

**Example:**
```bash
curl https://your-domain.vercel.app/api/bookings/by-reference/HT-20241002-001
```

---

### 5. Get Flight Bookings

Retrieves all bookings for a specific flight.

**Endpoint:** `GET /api/flights/[id]/bookings`

**Authentication:** Admin (coordinator dashboard)

**URL Parameters:**
- `id` - Flight UUID

**Response:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "booking_reference": "HT-20241002-001",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "+962-XXX-XXXX",
      "passenger_count": 2,
      "total_weight_kg": 137.5,
      "booking_type": "online",
      "payment_status": "confirmed",
      "status": "confirmed",
      "created_at": "2024-10-02T10:30:00Z",
      "passengers": [
        {
          "id": "uuid",
          "name": "John Doe",
          "weight_kg": 75.5,
          "seat_number": 1
        },
        {
          "id": "uuid",
          "name": "Jane Smith",
          "weight_kg": 62.0,
          "seat_number": 2
        }
      ]
    }
  ]
}
```

**Notes:**
- Excludes cancelled bookings
- Includes full passenger details
- Sorted by creation time

**Example:**
```bash
curl https://your-domain.vercel.app/api/flights/abc-123/bookings
```

---

### 6. Check-in Passenger

Marks a booking as checked in.

**Endpoint:** `POST /api/bookings/[id]/check-in`

**Authentication:** Admin (coordinator dashboard)

**URL Parameters:**
- `id` - Booking UUID

**Request Body:** None

**Success Response:**
```json
{
  "success": true,
  "message": "Passenger checked in successfully"
}
```

**Error Responses:**

**Booking Not Found (404):**
```json
{
  "error": "Booking not found"
}
```

**Already Checked In (400):**
```json
{
  "error": "Booking already checked in or completed"
}
```

**Process:**
- Updates booking status to `checked_in`
- Records timestamp
- Used at helipad for passenger verification

**Example:**
```bash
curl -X POST https://your-domain.vercel.app/api/bookings/abc-123/check-in
```

---

### 7. Create Flight Hold

Creates a temporary 15-minute seat reservation.

**Endpoint:** `POST /api/holds/create`

**Authentication:** Admin (uses service role key)

**Request Body:**
```json
{
  "flight_id": "uuid",
  "passenger_count": 2,
  "session_id": "browser-session-id"
}
```

**Success Response:**
```json
{
  "success": true,
  "hold": {
    "id": "uuid",
    "flight_id": "uuid",
    "session_id": "browser-session-id",
    "passenger_count": 2,
    "expires_at": "2024-10-02T11:00:00Z",
    "created_at": "2024-10-02T10:45:00Z"
  },
  "expires_in_seconds": 900
}
```

**Error Responses:**

**Missing Fields (400):**
```json
{
  "error": "Missing required fields"
}
```

**Not Enough Seats (400):**
```json
{
  "error": "Not enough seats available",
  "actual_available": 1
}
```

**Process:**
1. Cleans up expired holds
2. Checks actual available seats (accounting for other holds)
3. Deletes any existing hold for this session on this flight
4. Creates new hold with 15-minute expiration
5. Returns hold details

**Notes:**
- Prevents double-booking during checkout
- Automatically cleaned up after expiration
- One hold per session per flight
- Does not count toward flight capacity until booking created

**Example:**
```bash
curl -X POST https://your-domain.vercel.app/api/holds/create \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "abc-123",
    "passenger_count": 2,
    "session_id": "session-xyz"
  }'
```

---

### 8. Release Flight Hold

Releases a hold before expiration.

**Endpoint:** `POST /api/holds/release`

**Authentication:** Admin (uses service role key)

**Request Body:**
```json
{
  "flight_id": "uuid",
  "session_id": "browser-session-id"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Hold released successfully"
}
```

**Error Responses:**

**Missing Fields (400):**
```json
{
  "error": "Missing required fields"
}
```

**Notes:**
- Called when user navigates away from booking form
- Called after successful booking creation
- No error if hold doesn't exist

**Example:**
```bash
curl -X POST https://your-domain.vercel.app/api/holds/release \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "abc-123",
    "session_id": "session-xyz"
  }'
```

---

### 9. Get Analytics

Retrieves performance metrics and analytics.

**Endpoint:** `GET /api/analytics`

**Authentication:** Admin (coordinator dashboard)

**Query Parameters:**
- `range` - Time range: `today` | `week` | `month` (default: `today`)

**Response:**
```json
{
  "data": {
    "totalFlights": 12,
    "totalBookings": 8,
    "totalPassengers": 18,
    "totalRevenue": 2700,
    "avgSeatUtilization": 75.5,
    "avgWeightUtilization": 68.2,
    "bookingsByType": {
      "online": 5,
      "phone": 2,
      "walkin": 1
    },
    "popularTimeSlots": [
      {
        "time": "09:00",
        "count": 4
      },
      {
        "time": "14:00",
        "count": 3
      },
      {
        "time": "11:00",
        "count": 1
      }
    ]
  }
}
```

**Metrics Explained:**

**totalFlights:** Number of flights in date range
**totalBookings:** Number of confirmed bookings (excludes cancelled)
**totalPassengers:** Total passengers across all bookings
**totalRevenue:** Calculated as `base_price × passenger_count` for all bookings
**avgSeatUtilization:** Average percentage of seats filled per flight (only flights with bookings)
**avgWeightUtilization:** Average percentage of weight capacity used per flight
**bookingsByType:** Breakdown by booking source (online/phone/walkin)
**popularTimeSlots:** Top 5 most booked time slots

**Date Ranges:**
- `today` - From midnight today
- `week` - Last 7 days
- `month` - Last 30 days

**Example:**
```bash
# Today's analytics
curl https://your-domain.vercel.app/api/analytics

# Weekly analytics
curl https://your-domain.vercel.app/api/analytics?range=week

# Monthly analytics
curl https://your-domain.vercel.app/api/analytics?range=month
```

---

## Data Types

### PassengerInput
```typescript
{
  name: string;        // 1-100 characters
  weight_kg: number;   // 20-200 kg
}
```

### BookingFormData
```typescript
{
  flight_id: string;              // UUID
  customer_name: string;          // 1-100 characters
  customer_email: string;         // Valid email format
  customer_phone: string;         // Phone number with country code
  passengers: PassengerInput[];   // 1-3 passengers
  total_weight_kg: number;        // Sum of passenger weights
}
```

### Flight
```typescript
{
  id: string;                     // UUID
  route_id: string;               // UUID
  scheduled_date: string;         // ISO date (YYYY-MM-DD)
  scheduled_time: string;         // Time (HH:MM:SS)
  max_passengers: number;         // Default: 3
  max_weight_kg: number;          // Default: 180.00
  current_passengers: number;     // Calculated automatically
  current_weight_kg: number;      // Calculated automatically
  status: FlightStatus;           // scheduled | confirmed | completed | cancelled
}
```

### AvailableFlight
```typescript
{
  // All Flight fields, plus:
  route_name: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  base_price: number;
  remaining_seats: number;        // Calculated
  remaining_weight_kg: number;    // Calculated
  held_seats: number;             // Active holds
  availability_level: string;     // full | high | low | none
}
```

### Booking
```typescript
{
  id: string;                     // UUID
  flight_id: string;              // UUID
  booking_reference: string;      // HT-YYYYMMDD-XXX
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  passenger_count: number;        // 1-3
  total_weight_kg: number;
  booking_type: BookingType;      // online | phone | walkin
  payment_status: PaymentStatus;  // pending | confirmed | refunded
  status: BookingStatus;          // pending | confirmed | checked_in | completed | cancelled
  qr_code: string;                // QR-{booking_reference}
  notes?: string;
  created_at: string;             // ISO timestamp
  updated_at: string;             // ISO timestamp
}
```

---

## Error Handling

### Common Errors

**Validation Errors (400):**
- Missing required fields
- Invalid data types
- Out of range values

**Not Found Errors (404):**
- Flight not found
- Booking not found
- Resource doesn't exist

**Capacity Errors (400):**
- Flight full (passenger limit)
- Weight limit exceeded
- No seats available for hold

**Server Errors (500):**
- Database connection issues
- Internal processing errors
- Unexpected failures

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "status": 400,
  "details": {
    "field": "Additional context if available"
  }
}
```

---

## Rate Limiting

**Current:** No rate limiting implemented (MVP)

**Recommendations for Production:**
- Customer endpoints: 100 requests/minute per IP
- Admin endpoints: 500 requests/minute
- Analytics endpoint: 10 requests/minute

---

## Best Practices

### 1. Booking Flow
```
1. GET /api/flights
   → Display available flights

2. POST /api/holds/create
   → Reserve seats for 15 minutes

3. POST /api/bookings/validate
   → Verify booking still possible

4. POST /api/bookings/create
   → Complete booking

5. POST /api/holds/release
   → Clean up hold (optional, auto-expires)

6. GET /api/bookings/by-reference/[ref]
   → Show confirmation
```

### 2. Error Handling
- Always check `canBook` before submitting booking
- Display user-friendly error messages
- Retry on network errors (except 400s)
- Log errors for debugging

### 3. Real-time Updates
- Poll `/api/flights` every 30 seconds for availability
- Use Supabase real-time subscriptions for instant updates
- Update UI immediately after booking creation

### 4. Session Management
- Generate unique session_id per browser session
- Store in localStorage or sessionStorage
- Use for hold management
- Clear on booking completion

---

## Testing

### Test Flight Creation
```sql
INSERT INTO flights (route_id, scheduled_date, scheduled_time)
VALUES (
  (SELECT id FROM routes LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  '10:00:00'
);
```

### Test Booking
```bash
# 1. Get available flights
FLIGHT_ID=$(curl -s https://your-domain.vercel.app/api/flights | jq -r '.flights[0].id')

# 2. Create booking
curl -X POST https://your-domain.vercel.app/api/bookings/create \
  -H "Content-Type: application/json" \
  -d "{
    \"flight_id\": \"$FLIGHT_ID\",
    \"customer_name\": \"Test User\",
    \"customer_email\": \"test@example.com\",
    \"customer_phone\": \"+962-XXX-XXXX\",
    \"passengers\": [{\"name\": \"Test User\", \"weight_kg\": 75}],
    \"total_weight_kg\": 75
  }"
```

### Test Hold System
```bash
# Create hold
curl -X POST https://your-domain.vercel.app/api/holds/create \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "your-flight-id",
    "passenger_count": 2,
    "session_id": "test-session-123"
  }'

# Wait 15 minutes or release manually
curl -X POST https://your-domain.vercel.app/api/holds/release \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "your-flight-id",
    "session_id": "test-session-123"
  }'
```

---

## Performance Considerations

### Database Optimization
- All foreign keys indexed
- Composite index on (scheduled_date, status)
- Views use efficient joins
- Triggers optimized for single-row operations

### Caching Recommendations
- Cache `/api/flights` for 30 seconds
- Cache analytics for 5 minutes
- No caching on booking operations (always fresh)

### Query Optimization
- Use `select('*')` instead of selecting individual fields
- Limit results where appropriate
- Use views for complex queries
- Index frequently queried fields

---

## Migration Guide

### Adding New Endpoint

1. Create file in `/app/api/[endpoint]/route.ts`
2. Export `GET`, `POST`, `PUT`, or `DELETE` function
3. Use `NextRequest` and `NextResponse` types
4. Add error handling and validation
5. Update this documentation

### Modifying Existing Endpoint

1. Update route handler
2. Test all existing functionality
3. Update TypeScript types in `/lib/types.ts`
4. Update this documentation
5. Version if breaking change

---

## Support

**Documentation:**
- Database: `DATABASE_SCHEMA.md`
- Setup: `SETUP_GUIDE.md`
- Project: `PROJECT_BRIEF.md`

**Repository:** https://github.com/Nsour-IS/Heli-tours

**Live API:** https://heli-tours-git-main-nsour-is-projects.vercel.app/api

---

**Last Updated:** October 17, 2025
**API Version:** 1.0
