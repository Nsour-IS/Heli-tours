# Database Schema Documentation

**Project:** Helicopter Tours Amman
**Database:** PostgreSQL (via Supabase)
**Schema Version:** 1.1
**Last Updated:** October 17, 2025

---

## Overview

The database is designed to manage helicopter tour bookings with a focus on **weight-based passenger optimization**. The schema supports:
- Multiple tour routes
- Scheduled flights with capacity limits
- Customer bookings with multiple passengers
- Real-time capacity tracking
- Temporary seat reservations (holds)

---

## Entity Relationship Diagram

```
routes (1) ──────< (N) flights (1) ──────< (N) bookings (1) ──────< (N) passengers
                             │
                             └──────< (N) flight_holds
```

---

## Tables

### 1. `routes`

Defines available helicopter tour routes.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique route identifier |
| `name` | TEXT | NOT NULL | Route name (e.g., "Amman Classic Tour") |
| `origin` | TEXT | NOT NULL | Starting helipad location |
| `destination` | TEXT | NOT NULL | Tour destination/description |
| `duration_minutes` | INTEGER | NOT NULL | Flight duration |
| `base_price` | DECIMAL(10,2) | NOT NULL | Price per passenger |
| `description` | TEXT | NULLABLE | Detailed route description |
| `status` | route_status | DEFAULT 'active' | 'active' or 'inactive' |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |

**Indexes:**
- Primary key on `id`

**Example Data:**
```sql
{
  "id": "uuid-here",
  "name": "Amman Classic Tour",
  "origin": "CitiMall Helipad",
  "destination": "Madaba & Jordan Valley View",
  "duration_minutes": 12,
  "base_price": 150.00,
  "status": "active"
}
```

---

### 2. `flights`

Scheduled flights for specific routes and times.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique flight identifier |
| `route_id` | UUID | NOT NULL, FK → routes(id) CASCADE | Associated route |
| `scheduled_date` | DATE | NOT NULL | Flight date |
| `scheduled_time` | TIME | NOT NULL | Flight time |
| `max_passengers` | INTEGER | NOT NULL, DEFAULT 3 | Maximum passenger capacity |
| `max_weight_kg` | DECIMAL(6,2) | NOT NULL, DEFAULT 180.00 | Maximum total weight |
| `current_passengers` | INTEGER | NOT NULL, DEFAULT 0 | Current booked passengers |
| `current_weight_kg` | DECIMAL(6,2) | NOT NULL, DEFAULT 0.00 | Current total weight |
| `status` | flight_status | DEFAULT 'scheduled' | Flight status |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |

**Constraints:**
- `valid_passenger_count`: `current_passengers >= 0 AND current_passengers <= max_passengers`
- `valid_weight`: `current_weight_kg >= 0 AND current_weight_kg <= max_weight_kg`

**Indexes:**
- Primary key on `id`
- `idx_flights_date_status` on `(scheduled_date, status)`
- `idx_flights_route` on `route_id`

**Status Values:**
- `scheduled` - Flight is scheduled and accepting bookings
- `confirmed` - Flight has confirmed bookings
- `completed` - Flight has taken place
- `cancelled` - Flight was cancelled

**Notes:**
- `current_passengers` and `current_weight_kg` are automatically updated via triggers
- These fields represent confirmed bookings only (excludes cancelled)

---

### 3. `bookings`

Customer bookings for flights.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique booking identifier |
| `flight_id` | UUID | NOT NULL, FK → flights(id) CASCADE | Associated flight |
| `booking_reference` | TEXT | UNIQUE, NOT NULL | Human-readable reference (HT-YYYYMMDD-XXX) |
| `customer_name` | TEXT | NOT NULL | Customer full name |
| `customer_email` | TEXT | NOT NULL | Customer email |
| `customer_phone` | TEXT | NOT NULL | Customer phone number |
| `passenger_count` | INTEGER | NOT NULL | Number of passengers in booking |
| `total_weight_kg` | DECIMAL(6,2) | NOT NULL | Combined weight of all passengers |
| `booking_type` | booking_type | DEFAULT 'online' | Booking source |
| `payment_status` | payment_status | DEFAULT 'pending' | Payment state |
| `status` | booking_status | DEFAULT 'pending' | Booking state |
| `qr_code` | TEXT | NULLABLE | QR code data for check-in |
| `notes` | TEXT | NULLABLE | Additional notes |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Booking creation time |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |

**Constraints:**
- `valid_booking_passenger_count`: `passenger_count > 0 AND passenger_count <= 3`
- `valid_booking_weight`: `total_weight_kg > 0`

**Indexes:**
- Primary key on `id`
- `idx_bookings_reference` on `booking_reference` (for fast lookups)
- `idx_bookings_flight` on `flight_id`
- `idx_bookings_customer_email` on `customer_email`

**Enum Values:**

**booking_type:**
- `online` - Booked via customer app
- `phone` - Booked via phone call
- `walkin` - Walk-in booking at helipad

**payment_status:**
- `pending` - Payment not received
- `confirmed` - Payment received
- `refunded` - Payment refunded

**booking_status:**
- `pending` - Booking created, awaiting confirmation
- `confirmed` - Booking confirmed
- `checked_in` - Customer checked in at helipad
- `completed` - Flight completed
- `cancelled` - Booking cancelled

**Booking Reference Format:**
```
HT-20241002-001
│  │        │
│  │        └── Sequence number (3 digits, daily reset)
│  └── Date (YYYYMMDD)
└── Prefix (Heli Tours)
```

---

### 4. `passengers`

Individual passengers within a booking.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique passenger identifier |
| `booking_id` | UUID | NOT NULL, FK → bookings(id) CASCADE | Associated booking |
| `name` | TEXT | NOT NULL | Passenger full name |
| `weight_kg` | DECIMAL(5,2) | NOT NULL | Passenger weight |
| `seat_number` | INTEGER | NULLABLE | Assigned seat (1-3) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |

**Constraints:**
- `valid_passenger_weight`: `weight_kg > 0 AND weight_kg <= 200`
- `valid_seat_number`: `seat_number IS NULL OR (seat_number >= 1 AND seat_number <= 3)`

**Indexes:**
- Primary key on `id`
- `idx_passengers_booking` on `booking_id`

**Notes:**
- Weight range: 20kg - 200kg (enforced at application level)
- Seat assignment is optional and managed by coordinator

---

### 5. `flight_holds`

Temporary seat reservations during booking process.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique hold identifier |
| `flight_id` | UUID | NOT NULL, FK → flights(id) CASCADE | Associated flight |
| `session_id` | TEXT | NOT NULL | Browser session identifier |
| `passenger_count` | INTEGER | NOT NULL | Number of seats held |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Expiration time (15 min) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Hold creation time |

**Constraints:**
- `valid_hold_passenger_count`: `passenger_count > 0 AND passenger_count <= 3`
- `expires_at > created_at`

**Indexes:**
- Primary key on `id`
- `idx_flight_holds_flight` on `flight_id`
- `idx_flight_holds_session` on `session_id`
- `idx_flight_holds_expires` on `expires_at` (for cleanup)

**Purpose:**
- Prevents double-booking during checkout process
- Holds expire after 15 minutes
- Automatically cleaned up by scheduled function
- Released when booking is completed or abandoned

---

### 6. `helipad_locations`

Helipad locations for future expansion (currently unused).

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique location identifier |
| `name` | TEXT | NOT NULL | Helipad name |
| `address` | TEXT | NOT NULL | Physical address |
| `city` | TEXT | NOT NULL | City |
| `latitude` | DECIMAL(10,8) | NULLABLE | GPS latitude |
| `longitude` | DECIMAL(11,8) | NULLABLE | GPS longitude |
| `status` | route_status | DEFAULT 'active' | Location status |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |

**Future Use:**
- Multi-location heli-taxi service
- Route planning between helipads
- Geographic search capabilities

---

## Functions

### 1. `generate_booking_reference()`

Generates unique booking references in format `HT-YYYYMMDD-XXX`.

**Type:** Returns TEXT
**Usage:** Called automatically when inserting bookings

**Logic:**
1. Gets current date in YYYYMMDD format
2. Counts existing bookings for today
3. Increments count and pads to 3 digits
4. Returns formatted reference

**Example:**
```sql
SELECT generate_booking_reference();
-- Returns: 'HT-20241002-001'
```

---

### 2. `update_flight_totals()`

Automatically updates flight capacity when bookings change.

**Type:** TRIGGER FUNCTION
**Fires:** After INSERT, UPDATE, DELETE on bookings table
**Updates:** `flights.current_passengers` and `flights.current_weight_kg`

**Logic:**
- Sums `passenger_count` from all non-cancelled bookings
- Sums `total_weight_kg` from all non-cancelled bookings
- Updates corresponding flight record
- Ignores cancelled bookings

**Trigger:**
```sql
CREATE TRIGGER trg_update_flight_totals
AFTER INSERT OR UPDATE OF status, passenger_count, total_weight_kg OR DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_flight_totals();
```

---

### 3. `update_updated_at_column()`

Updates the `updated_at` timestamp on record modification.

**Type:** TRIGGER FUNCTION
**Fires:** Before UPDATE on flights and bookings tables
**Updates:** `updated_at` to current timestamp

**Applied to:**
- `flights` table
- `bookings` table

---

### 4. `cleanup_expired_holds()`

Removes expired seat holds.

**Type:** Returns VOID
**Usage:** Called periodically (every 5 minutes recommended)

**Logic:**
```sql
DELETE FROM flight_holds
WHERE expires_at < NOW();
```

**Scheduling:**
```sql
-- Run via cron job or scheduled function
SELECT cleanup_expired_holds();
```

---

### 5. `get_flight_available_seats(flight_id UUID)`

Calculates actual available seats accounting for holds.

**Type:** Returns INTEGER
**Parameters:** `flight_id` UUID

**Logic:**
1. Gets flight's max passengers and current passengers
2. Counts active (non-expired) holds for the flight
3. Returns: `max_passengers - current_passengers - held_seats`

**Example:**
```sql
SELECT get_flight_available_seats('flight-uuid-here');
-- Returns: 1 (if 2 seats booked, 0 held, max 3)
```

---

### 6. `set_user_email(email TEXT)`

Sets user email for session-based RLS.

**Type:** Returns VOID
**Security:** SECURITY DEFINER
**Purpose:** Allows API to set user context for Row Level Security

**Usage:**
```sql
SELECT set_user_email('customer@example.com');
```

---

## Views

### 1. `available_flights`

Shows scheduled flights with remaining capacity.

**Columns:**
- All flight fields
- Route details (name, origin, destination, duration, price)
- `remaining_seats` - Seats available
- `remaining_weight_kg` - Weight capacity remaining
- `held_seats` - Seats currently held
- `availability_level` - 'full', 'high', 'low', 'none'

**Filter:**
- Only `status = 'scheduled'` flights
- Only future flights (`scheduled_date >= CURRENT_DATE`)

**Usage:**
```sql
SELECT * FROM available_flights
WHERE scheduled_date = '2024-10-10'
ORDER BY scheduled_time;
```

**Availability Levels:**
- `full` - No seats or weight capacity left
- `high` - 2 or more seats available
- `low` - 1 seat available
- `none` - Flight at capacity

---

### 2. `booking_details`

Complete booking information with passengers and flight details.

**Columns:**
- All booking fields
- Flight details (date, time)
- Route details (name, origin, destination)
- `passengers` - JSON array of passenger objects

**Passenger Object:**
```json
{
  "name": "John Doe",
  "weight_kg": 75.00,
  "seat_number": 1
}
```

**Usage:**
```sql
SELECT * FROM booking_details
WHERE booking_reference = 'HT-20241002-001';
```

---

## Row Level Security (RLS)

RLS is enabled on all tables to protect sensitive data.

### Routes
- **Public read:** Active routes visible to all
- **Admin write:** Only admins can modify

### Flights
- **Public read:** Scheduled/confirmed flights for future dates
- **Admin write:** Only admins can modify

### Bookings
- **Public insert:** Anyone can create bookings
- **Customer read:** Users can view their own bookings (by email)
- **Customer update:** Users can modify their own bookings
- **Admin full access:** Admins can do everything

### Passengers
- **Public insert:** Anyone can create passenger records (during booking)
- **Customer read/update:** Users can view/modify passengers in their bookings
- **Admin full access:** Admins can do everything

### Flight Holds
- **Public insert/delete:** Session-based access via session_id
- **Auto-cleanup:** Expired holds removed automatically

---

## Constraints & Validation

### Business Rules

1. **Max 3 passengers per flight**
   - Enforced at flight level: `max_passengers = 3`
   - Enforced at booking level: `passenger_count <= 3`

2. **Max 180kg total weight per flight**
   - Enforced at flight level: `max_weight_kg = 180.00`
   - Validated in application before booking

3. **Individual passenger weight: 20-200kg**
   - Database: `weight_kg > 0 AND weight_kg <= 200`
   - Application: 20kg minimum for realistic validation

4. **Flight capacity tracking**
   - Automatic via triggers
   - Always reflects sum of non-cancelled bookings

5. **Unique booking references**
   - Format: HT-YYYYMMDD-XXX
   - Daily sequence reset
   - UNIQUE constraint enforced

6. **Hold expiration**
   - Expires after 15 minutes
   - Cleaned up automatically
   - Not counted in flight capacity

---

## Indexes & Performance

### Query Optimization

**Most common queries:**

1. **Find available flights by date**
   ```sql
   -- Uses: idx_flights_date_status
   SELECT * FROM available_flights
   WHERE scheduled_date = ?
   ```

2. **Lookup booking by reference**
   ```sql
   -- Uses: idx_bookings_reference
   SELECT * FROM booking_details
   WHERE booking_reference = ?
   ```

3. **Get flight bookings**
   ```sql
   -- Uses: idx_bookings_flight
   SELECT * FROM bookings
   WHERE flight_id = ?
   ```

4. **Find customer bookings**
   ```sql
   -- Uses: idx_bookings_customer_email
   SELECT * FROM bookings
   WHERE customer_email = ?
   ```

### Performance Notes

- All foreign keys are indexed automatically
- Views use efficient joins
- Triggers are optimized for single-row operations
- Hold cleanup runs on schedule, not per-query

---

## Migration History

### Migration 1: Initial Schema (20241002000000)
- Created all core tables
- Added constraints and indexes
- Implemented automatic booking reference generation
- Added flight total update triggers
- Created views for common queries

### Migration 2: RLS Policies (20241002000001)
- Enabled Row Level Security on all tables
- Created public access policies for customer app
- Created admin policies for coordinator dashboard
- Added session-based user context function

### Migration 3: Flight Holds (20241002000002)
- Added `flight_holds` table
- Created hold expiration logic
- Updated `available_flights` view to include held seats
- Added cleanup function

---

## Sample Queries

### Create a Route
```sql
INSERT INTO routes (name, origin, destination, duration_minutes, base_price, description)
VALUES (
  'Amman Classic Tour',
  'CitiMall Helipad',
  'Madaba & Jordan Valley View',
  12,
  150.00,
  'Scenic tour of Amman, Madaba, and the Jordan Valley'
);
```

### Schedule Flights
```sql
INSERT INTO flights (route_id, scheduled_date, scheduled_time)
VALUES
  ((SELECT id FROM routes WHERE name = 'Amman Classic Tour'), '2024-10-10', '09:00:00'),
  ((SELECT id FROM routes WHERE name = 'Amman Classic Tour'), '2024-10-10', '11:00:00'),
  ((SELECT id FROM routes WHERE name = 'Amman Classic Tour'), '2024-10-10', '14:00:00');
```

### Check Flight Availability
```sql
SELECT
  scheduled_time,
  remaining_seats,
  remaining_weight_kg,
  availability_level
FROM available_flights
WHERE scheduled_date = '2024-10-10'
ORDER BY scheduled_time;
```

### Get Today's Bookings
```sql
SELECT
  booking_reference,
  customer_name,
  passenger_count,
  total_weight_kg,
  status
FROM bookings b
JOIN flights f ON b.flight_id = f.id
WHERE f.scheduled_date = CURRENT_DATE
ORDER BY f.scheduled_time, b.created_at;
```

### Calculate Utilization
```sql
SELECT
  scheduled_date,
  COUNT(*) as total_flights,
  AVG(current_passengers::FLOAT / max_passengers * 100) as seat_utilization,
  AVG(current_weight_kg / max_weight_kg * 100) as weight_utilization
FROM flights
WHERE scheduled_date >= CURRENT_DATE
  AND status != 'cancelled'
GROUP BY scheduled_date
ORDER BY scheduled_date;
```

---

## Maintenance Tasks

### Daily
- Review flight capacity and bookings
- Monitor hold expiration cleanup

### Weekly
- Analyze seat utilization rates
- Review booking patterns

### Monthly
- Archive completed flights
- Database performance review
- Index usage analysis

### As Needed
- Update route pricing
- Modify flight schedules
- Adjust capacity limits

---

## Future Enhancements

### Planned
1. **Multi-helicopter fleet management**
   - Add `helicopters` table
   - Link flights to specific aircraft
   - Track maintenance schedules

2. **Dynamic pricing**
   - Add `pricing_rules` table
   - Peak/off-peak pricing
   - Last-minute deals

3. **User authentication**
   - Integrate Supabase Auth
   - Add `user_id` to bookings
   - Role-based access control

4. **Pilot management**
   - Add `pilots` and `pilot_schedules` tables
   - Assign pilots to flights
   - Track flight hours

5. **Route waypoints**
   - Add `waypoints` table
   - Multi-stop tours
   - Distance calculations

---

## Support

**Database Questions:** See `SETUP_GUIDE.md`
**API Usage:** See `API_DOCUMENTATION.md`
**General Info:** See `PROJECT_BRIEF.md`

**Last Updated:** October 17, 2025
