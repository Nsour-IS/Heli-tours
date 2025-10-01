-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE helipad_locations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROUTES POLICIES
-- =====================================================

-- Allow everyone to read active routes (public facing)
CREATE POLICY "Public can view active routes"
ON routes FOR SELECT
USING (status = 'active');

-- Admin users can do everything (for future auth implementation)
CREATE POLICY "Admins can manage routes"
ON routes FOR ALL
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- =====================================================
-- FLIGHTS POLICIES
-- =====================================================

-- Allow everyone to read scheduled flights (public facing)
CREATE POLICY "Public can view scheduled flights"
ON flights FOR SELECT
USING (
    status IN ('scheduled', 'confirmed')
    AND scheduled_date >= CURRENT_DATE
);

-- Admin users can do everything
CREATE POLICY "Admins can manage flights"
ON flights FOR ALL
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- Users can insert their own bookings (public booking form)
CREATE POLICY "Anyone can create bookings"
ON bookings FOR INSERT
WITH CHECK (true);

-- Users can view their own bookings by email
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (
    customer_email = current_setting('app.user_email', true)
    OR auth.jwt() ->> 'role' = 'admin'
);

-- Users can update their own bookings (for cancellations, modifications)
CREATE POLICY "Users can update their own bookings"
ON bookings FOR UPDATE
USING (
    customer_email = current_setting('app.user_email', true)
    OR auth.jwt() ->> 'role' = 'admin'
);

-- Admins can do everything
CREATE POLICY "Admins can manage all bookings"
ON bookings FOR ALL
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- =====================================================
-- PASSENGERS POLICIES
-- =====================================================

-- Allow insert for new bookings
CREATE POLICY "Anyone can create passenger records"
ON passengers FOR INSERT
WITH CHECK (true);

-- Users can view passengers in their bookings
CREATE POLICY "Users can view their own passengers"
ON passengers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = passengers.booking_id
        AND (
            bookings.customer_email = current_setting('app.user_email', true)
            OR auth.jwt() ->> 'role' = 'admin'
        )
    )
);

-- Users can update passengers in their bookings
CREATE POLICY "Users can update their own passengers"
ON passengers FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = passengers.booking_id
        AND (
            bookings.customer_email = current_setting('app.user_email', true)
            OR auth.jwt() ->> 'role' = 'admin'
        )
    )
);

-- Admins can do everything
CREATE POLICY "Admins can manage all passengers"
ON passengers FOR ALL
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- =====================================================
-- HELIPAD LOCATIONS POLICIES
-- =====================================================

-- Allow everyone to read active helipad locations
CREATE POLICY "Public can view active helipads"
ON helipad_locations FOR SELECT
USING (status = 'active');

-- Admins can manage
CREATE POLICY "Admins can manage helipads"
ON helipad_locations FOR ALL
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to set user email for session (used by API)
-- This allows the app to set a user's email without full auth
CREATE OR REPLACE FUNCTION set_user_email(email TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.user_email', email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTES ON RLS IMPLEMENTATION
-- =====================================================

/*
For MVP without full authentication:
- The app will use service role key for admin dashboard
- Customer app will set user email via set_user_email() function
- Booking reference acts as authentication token for customers

For future with proper auth:
- Implement Supabase Auth
- Add user_id columns to bookings
- Update RLS policies to use auth.uid()
- Add coordinator/admin roles
*/
