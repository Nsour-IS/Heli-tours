-- =====================================================
-- FLIGHT HOLDS TABLE
-- Temporary holds when customers are filling booking forms
-- =====================================================

CREATE TABLE flight_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- Browser session identifier
    passenger_count INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_hold_passenger_count CHECK (passenger_count > 0 AND passenger_count <= 3)
);

-- Index for quick lookups
CREATE INDEX idx_flight_holds_flight ON flight_holds(flight_id);
CREATE INDEX idx_flight_holds_session ON flight_holds(session_id);
CREATE INDEX idx_flight_holds_expires ON flight_holds(expires_at);

-- =====================================================
-- FUNCTION: Clean up expired holds
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS void AS $$
BEGIN
    DELETE FROM flight_holds
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get available capacity considering holds
-- =====================================================

CREATE OR REPLACE FUNCTION get_flight_available_seats(p_flight_id UUID)
RETURNS TABLE(
    available_seats INTEGER,
    held_seats INTEGER,
    actual_available INTEGER
) AS $$
BEGIN
    -- First clean up expired holds
    PERFORM cleanup_expired_holds();

    RETURN QUERY
    SELECT
        f.max_passengers - f.current_passengers as available_seats,
        COALESCE(SUM(h.passenger_count), 0)::INTEGER as held_seats,
        (f.max_passengers - f.current_passengers - COALESCE(SUM(h.passenger_count), 0))::INTEGER as actual_available
    FROM flights f
    LEFT JOIN flight_holds h ON f.id = h.flight_id AND h.expires_at > NOW()
    WHERE f.id = p_flight_id
    GROUP BY f.id, f.max_passengers, f.current_passengers;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATED VIEW: Available flights with holds
-- =====================================================

DROP VIEW IF EXISTS available_flights;

CREATE OR REPLACE VIEW available_flights AS
SELECT
    f.id,
    f.route_id,
    r.name as route_name,
    r.origin,
    r.destination,
    r.duration_minutes,
    r.base_price,
    f.scheduled_date,
    f.scheduled_time,
    f.max_passengers,
    f.max_weight_kg,
    f.current_passengers,
    f.current_weight_kg,
    (f.max_passengers - f.current_passengers) as remaining_seats,
    COALESCE((
        SELECT SUM(passenger_count)
        FROM flight_holds
        WHERE flight_id = f.id
        AND expires_at > NOW()
    ), 0)::INTEGER as held_seats,
    (f.max_passengers - f.current_passengers - COALESCE((
        SELECT SUM(passenger_count)
        FROM flight_holds
        WHERE flight_id = f.id
        AND expires_at > NOW()
    ), 0))::INTEGER as actual_available_seats,
    (f.max_weight_kg - f.current_weight_kg) as remaining_weight_kg,
    f.status,
    CASE
        WHEN (f.max_passengers - f.current_passengers - COALESCE((
            SELECT SUM(passenger_count)
            FROM flight_holds
            WHERE flight_id = f.id
            AND expires_at > NOW()
        ), 0)) <= 0 THEN 'full'
        WHEN (f.max_passengers - f.current_passengers - COALESCE((
            SELECT SUM(passenger_count)
            FROM flight_holds
            WHERE flight_id = f.id
            AND expires_at > NOW()
        ), 0)) >= 2 THEN 'high'
        WHEN (f.max_passengers - f.current_passengers - COALESCE((
            SELECT SUM(passenger_count)
            FROM flight_holds
            WHERE flight_id = f.id
            AND expires_at > NOW()
        ), 0)) = 1 THEN 'low'
        ELSE 'none'
    END as availability_level
FROM flights f
JOIN routes r ON f.route_id = r.id
WHERE f.status = 'scheduled'
AND f.scheduled_date >= CURRENT_DATE;

-- =====================================================
-- RLS POLICIES FOR HOLDS
-- =====================================================

ALTER TABLE flight_holds ENABLE ROW LEVEL SECURITY;

-- Anyone can create holds
CREATE POLICY "Anyone can create holds"
ON flight_holds FOR INSERT
WITH CHECK (true);

-- Anyone can view holds for availability checking
CREATE POLICY "Anyone can view holds"
ON flight_holds FOR SELECT
USING (true);

-- Users can delete their own holds
CREATE POLICY "Users can delete their own holds"
ON flight_holds FOR DELETE
USING (session_id = current_setting('app.session_id', true) OR auth.jwt() ->> 'role' = 'admin');

-- Admins can delete any hold
CREATE POLICY "Admins can delete any hold"
ON flight_holds FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE flight_holds IS 'Temporary seat reservations during booking process (10-15 min)';
COMMENT ON COLUMN flight_holds.session_id IS 'Browser session ID to identify the customer';
COMMENT ON COLUMN flight_holds.expires_at IS 'When the hold automatically expires';
COMMENT ON FUNCTION cleanup_expired_holds() IS 'Removes expired holds from the system';
COMMENT ON FUNCTION get_flight_available_seats(UUID) IS 'Returns actual available seats considering active holds';
