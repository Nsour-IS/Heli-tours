# Supabase Database Setup

This directory contains the database schema and setup scripts for the Helicopter Tours Amman booking system.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20241002000000_initial_schema.sql    # Core tables, functions, views
│   └── 20241002000001_rls_policies.sql      # Row Level Security policies
├── seed/
│   └── demo_data.sql                         # Demo/test data
└── README.md
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Migrations

You can run migrations using the Supabase CLI or directly in the SQL editor.

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Manual SQL Execution

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run each migration file in order:
   - `20241002000000_initial_schema.sql`
   - `20241002000001_rls_policies.sql`

### 3. Load Seed Data (Optional)

For demo/testing purposes, load the sample data:

```bash
# Using Supabase CLI
supabase db reset --db-url your-db-url

# Or copy and paste the contents of demo_data.sql in SQL Editor
```

### 4. Configure Environment Variables

Create a `.env.local` file in your Next.js project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema Overview

### Core Tables

1. **routes** - Helicopter tour routes
   - Stores route information (origin, destination, duration, pricing)
   - Currently: Amman Classic Tour, Dead Sea Sunset Flight

2. **flights** - Scheduled flights
   - Links to routes
   - Tracks scheduled date/time
   - Auto-calculates current passenger count and weight
   - Maximum: 3 passengers, 180kg total weight

3. **bookings** - Customer bookings
   - Stores customer information
   - Links to flights
   - Generates unique booking references (HT-YYYYMMDD-XXX)
   - Tracks payment and booking status

4. **passengers** - Individual passenger details
   - Links to bookings
   - Stores individual weights (critical for optimization)
   - Optional seat assignments

5. **helipad_locations** - Future expansion
   - Helipad locations for multi-point service
   - Currently inactive

### Key Features

#### Automatic Weight Tracking
- Trigger `trg_update_flight_totals` automatically updates flight totals when bookings change
- Ensures data consistency
- Excludes cancelled bookings from calculations

#### Booking Reference Generation
- Format: `HT-YYYYMMDD-XXX`
- Function `generate_booking_reference()` auto-generates unique references
- Example: `HT-20241002-001`

#### Views for Easy Querying

1. **available_flights**
   - Shows all scheduled flights with availability
   - Calculates remaining seats and weight capacity
   - Includes availability level (high/low/full/none)

2. **booking_details**
   - Complete booking information with passenger details
   - Joins bookings, flights, routes, and passengers
   - Returns passengers as JSON array

## Weight Optimization Algorithm

The core business logic:

```sql
-- Check if booking can be accommodated
1. Current passengers + new passengers <= max_passengers (3)
2. Current weight + new weight <= max_weight (180kg)
3. Both conditions must be true
```

### Example Scenarios

**Scenario 1: Optimal (✓)**
- Flight: 0/180kg, 0/3 passengers
- New booking: 3 passengers, 175kg total
- Result: Accepted, 5kg buffer remaining

**Scenario 2: Weight limit (✗)**
- Flight: 140/180kg, 2/3 passengers
- New booking: 1 passenger, 55kg
- Result: Rejected (would be 195kg total)
- Alternative: Suggest next available slot

**Scenario 3: Underutilized (⚠️)**
- Flight: 130/180kg, 2/3 passengers
- Remaining capacity: 1 passenger up to 50kg
- Opportunity: System suggests adding 1 more passenger

## Row Level Security (RLS)

### Customer Access
- Can create bookings (public)
- Can view/update own bookings by email
- Weight data privacy protected

### Admin Access
- Full access to all tables (requires `admin` role in JWT)
- Coordinator dashboard uses service role key

### MVP Approach
For the initial MVP without full authentication:
- Customer app sets email via `set_user_email()` function
- Booking reference acts as authentication token
- Admin dashboard uses service role key

### Future with Auth
- Implement Supabase Auth
- Add `user_id` columns
- Update policies to use `auth.uid()`

## Testing Queries

### Check Available Flights
```sql
SELECT * FROM available_flights
WHERE scheduled_date >= CURRENT_DATE
ORDER BY scheduled_date, scheduled_time;
```

### Check Booking Details
```sql
SELECT * FROM booking_details
WHERE booking_reference = 'HT-20241002-001';
```

### Verify Weight Calculations
```sql
SELECT
    f.scheduled_time,
    f.current_passengers || '/' || f.max_passengers as passengers,
    f.current_weight_kg || '/' || f.max_weight_kg as weight,
    (f.max_weight_kg - f.current_weight_kg) as available_weight
FROM flights f
WHERE scheduled_date = CURRENT_DATE
ORDER BY scheduled_time;
```

### Utilization Statistics
```sql
SELECT
    COUNT(*) as total_flights,
    ROUND(AVG(current_passengers::numeric / max_passengers * 100), 2) as avg_seat_utilization,
    ROUND(AVG(current_weight_kg / max_weight_kg * 100), 2) as avg_weight_utilization
FROM flights
WHERE scheduled_date >= CURRENT_DATE;
```

## Next Steps

1. ✅ Create Supabase project
2. ✅ Run migrations
3. ✅ Load seed data
4. 🔄 Set up Next.js with Supabase client
5. 🔄 Build booking form with weight validation
6. 🔄 Create coordinator dashboard

## Support

For issues with the database schema or Supabase setup:
- Check Supabase logs in dashboard
- Verify migration order
- Ensure RLS policies don't block expected operations
- Use service role key for admin operations
