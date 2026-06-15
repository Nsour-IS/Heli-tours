-- Create flight_holds table for temporary seat reservations during checkout
CREATE TABLE flight_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    passenger_count INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_hold_passenger_count CHECK (passenger_count > 0 AND passenger_count <= 3)
);

CREATE INDEX idx_flight_holds_flight ON flight_holds(flight_id);
CREATE INDEX idx_flight_holds_session ON flight_holds(session_id);
CREATE INDEX idx_flight_holds_expires ON flight_holds(expires_at);

-- Clean up expired holds
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS void AS $$
BEGIN
    DELETE FROM flight_holds WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Get available seats for a specific flight, accounting for active holds
CREATE OR REPLACE FUNCTION get_flight_available_seats(p_flight_id UUID)
RETURNS TABLE(
    total_seats INTEGER,
    booked_seats INTEGER,
    held_seats INTEGER,
    actual_available INTEGER
) AS $$
BEGIN
    PERFORM cleanup_expired_holds();

    RETURN QUERY
    SELECT
        f.max_passengers AS total_seats,
        f.current_passengers AS booked_seats,
        COALESCE((
            SELECT SUM(fh.passenger_count)::INTEGER
            FROM flight_holds fh
            WHERE fh.flight_id = p_flight_id
            AND fh.expires_at > NOW()
        ), 0) AS held_seats,
        GREATEST(
            f.max_passengers
            - f.current_passengers
            - COALESCE((
                SELECT SUM(fh.passenger_count)::INTEGER
                FROM flight_holds fh
                WHERE fh.flight_id = p_flight_id
                AND fh.expires_at > NOW()
            ), 0),
            0
        )::INTEGER AS actual_available
    FROM flights f
    WHERE f.id = p_flight_id;
END;
$$ LANGUAGE plpgsql;

-- Rebuild available_flights view to include hold-aware seat counts
CREATE OR REPLACE VIEW available_flights AS
SELECT
    f.id,
    f.route_id,
    r.name AS route_name,
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
    (f.max_passengers - f.current_passengers) AS remaining_seats,
    (f.max_weight_kg - f.current_weight_kg) AS remaining_weight_kg,
    COALESCE((
        SELECT SUM(fh.passenger_count)::INTEGER
        FROM flight_holds fh
        WHERE fh.flight_id = f.id
        AND fh.expires_at > NOW()
    ), 0) AS held_seats,
    GREATEST(
        f.max_passengers
        - f.current_passengers
        - COALESCE((
            SELECT SUM(fh.passenger_count)::INTEGER
            FROM flight_holds fh
            WHERE fh.flight_id = f.id
            AND fh.expires_at > NOW()
        ), 0),
        0
    )::INTEGER AS actual_available_seats,
    f.status,
    CASE
        WHEN f.current_passengers >= f.max_passengers THEN 'full'
        WHEN f.current_weight_kg >= f.max_weight_kg THEN 'full'
        WHEN GREATEST(
            f.max_passengers
            - f.current_passengers
            - COALESCE((
                SELECT SUM(fh.passenger_count)::INTEGER
                FROM flight_holds fh
                WHERE fh.flight_id = f.id
                AND fh.expires_at > NOW()
            ), 0),
            0
        ) = 0 THEN 'full'
        WHEN GREATEST(
            f.max_passengers
            - f.current_passengers
            - COALESCE((
                SELECT SUM(fh.passenger_count)::INTEGER
                FROM flight_holds fh
                WHERE fh.flight_id = f.id
                AND fh.expires_at > NOW()
            ), 0),
            0
        ) >= 2 THEN 'high'
        ELSE 'low'
    END AS availability_level
FROM flights f
JOIN routes r ON f.route_id = r.id
WHERE f.status = 'scheduled'
AND f.scheduled_date >= CURRENT_DATE;

COMMENT ON TABLE flight_holds IS 'Temporary seat reservations during the checkout flow (15-minute TTL)';
COMMENT ON FUNCTION cleanup_expired_holds() IS 'Deletes holds past their expiry time';
COMMENT ON FUNCTION get_flight_available_seats(UUID) IS 'Returns seat counts for a flight accounting for active holds';
