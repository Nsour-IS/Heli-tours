# Flight Holds Feature - Migration Instructions

## Overview
This migration adds temporary seat reservation functionality. When customers start booking, their seats are held for 15 minutes to prevent others from taking them while they fill out the form.

## Steps to Apply Migration

### 1. Run the SQL Migration

Go to your Supabase dashboard and run this migration:

**File:** `supabase/migrations/20241002000002_flight_holds.sql`

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `20241002000002_flight_holds.sql`
4. Paste and click "Run"

This will:
- Create `flight_holds` table
- Add cleanup function for expired holds
- Update `available_flights` view to include hold information
- Add RLS policies for holds

### 2. Verify Migration Success

Run this query to verify:

```sql
-- Should show the new holds table
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'flight_holds';

-- Should show updated view with held_seats column
SELECT * FROM available_flights LIMIT 1;
```

### 3. Test the Feature

After migration:
1. Visit your booking page
2. Click "Select" on any flight
3. Choose passenger count (1, 2, or 3)
4. Notice seats are now "held" for 15 minutes
5. Other customers will see "⏳ X being reserved"

## What This Does

### For Customers:
- **Before**: Risk of losing seats while filling form
- **After**: Seats are reserved for 15 minutes

### Visual Indicators:
- Shows "⏳ 2 being reserved" when others are booking
- Displays actual available seats (excluding holds)
- Prevents double-booking

### Auto-Cleanup:
- Holds expire after 15 minutes
- Released automatically when booking completes
- Released when customer cancels or goes back

## Troubleshooting

If you see errors about missing columns:
1. Make sure you ran the full migration file
2. Check that the `available_flights` view was recreated
3. Try refreshing the Supabase schema cache

If holds aren't working:
1. Check browser console for API errors
2. Verify environment variables are set in Vercel
3. Ensure RLS policies are active
