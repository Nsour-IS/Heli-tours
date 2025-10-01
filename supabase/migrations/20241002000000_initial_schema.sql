-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE route_status AS ENUM ('active', 'inactive');
CREATE TYPE flight_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled');
CREATE TYPE booking_type AS ENUM ('online', 'phone', 'walkin');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'refunded');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled');

-- =====================================================
-- ROUTES TABLE
-- =====================================================
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    status route_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FLIGHTS TABLE
-- =====================================================
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    max_passengers INTEGER NOT NULL DEFAULT 3,
    max_weight_kg DECIMAL(6,2) NOT NULL DEFAULT 180.00,
    current_passengers INTEGER NOT NULL DEFAULT 0,
    current_weight_kg DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    status flight_status DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_passenger_count CHECK (current_passengers >= 0 AND current_passengers <= max_passengers),
    CONSTRAINT valid_weight CHECK (current_weight_kg >= 0 AND current_weight_kg <= max_weight_kg)
);

-- Index for querying flights by date and status
CREATE INDEX idx_flights_date_status ON flights(scheduled_date, status);
CREATE INDEX idx_flights_route ON flights(route_id);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    booking_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    passenger_count INTEGER NOT NULL,
    total_weight_kg DECIMAL(6,2) NOT NULL,
    booking_type booking_type DEFAULT 'online',
    payment_status payment_status DEFAULT 'pending',
    status booking_status DEFAULT 'pending',
    qr_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_booking_passenger_count CHECK (passenger_count > 0 AND passenger_count <= 3),
    CONSTRAINT valid_booking_weight CHECK (total_weight_kg > 0)
);

-- Index for quick booking reference lookup
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_flight ON bookings(flight_id);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);

-- =====================================================
-- PASSENGERS TABLE
-- =====================================================
CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    seat_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_passenger_weight CHECK (weight_kg > 0 AND weight_kg <= 200),
    CONSTRAINT valid_seat_number CHECK (seat_number IS NULL OR (seat_number >= 1 AND seat_number <= 3))
);

-- Index for querying passengers by booking
CREATE INDEX idx_passengers_booking ON passengers(booking_id);

-- =====================================================
-- HELIPAD LOCATIONS TABLE (Future expansion)
-- =====================================================
CREATE TABLE helipad_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status route_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    date_part TEXT;
    sequence_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');

    -- Get the count of bookings today and add 1
    SELECT LPAD((COUNT(*) + 1)::TEXT, 3, '0') INTO sequence_part
    FROM bookings
    WHERE DATE(created_at) = CURRENT_DATE;

    ref := 'HT-' || date_part || '-' || sequence_part;
    RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Function to update flight weight and passenger count
CREATE OR REPLACE FUNCTION update_flight_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE flights
        SET
            current_passengers = (
                SELECT COALESCE(SUM(passenger_count), 0)
                FROM bookings
                WHERE flight_id = NEW.flight_id
                AND status NOT IN ('cancelled')
            ),
            current_weight_kg = (
                SELECT COALESCE(SUM(total_weight_kg), 0)
                FROM bookings
                WHERE flight_id = NEW.flight_id
                AND status NOT IN ('cancelled')
            ),
            updated_at = NOW()
        WHERE id = NEW.flight_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE flights
        SET
            current_passengers = (
                SELECT COALESCE(SUM(passenger_count), 0)
                FROM bookings
                WHERE flight_id = OLD.flight_id
                AND status NOT IN ('cancelled')
            ),
            current_weight_kg = (
                SELECT COALESCE(SUM(total_weight_kg), 0)
                FROM bookings
                WHERE flight_id = OLD.flight_id
                AND status NOT IN ('cancelled')
            ),
            updated_at = NOW()
        WHERE id = OLD.flight_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update flight totals when bookings change
CREATE TRIGGER trg_update_flight_totals
AFTER INSERT OR UPDATE OF status, passenger_count, total_weight_kg OR DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_flight_totals();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trg_flights_updated_at
BEFORE UPDATE ON flights
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for available flights with remaining capacity
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
    (f.max_weight_kg - f.current_weight_kg) as remaining_weight_kg,
    f.status,
    CASE
        WHEN f.current_passengers >= f.max_passengers THEN 'full'
        WHEN f.current_weight_kg >= f.max_weight_kg THEN 'full'
        WHEN (f.max_passengers - f.current_passengers) >= 2 THEN 'high'
        WHEN (f.max_passengers - f.current_passengers) = 1 THEN 'low'
        ELSE 'none'
    END as availability_level
FROM flights f
JOIN routes r ON f.route_id = r.id
WHERE f.status = 'scheduled'
AND f.scheduled_date >= CURRENT_DATE;

-- View for booking details with passenger information
CREATE OR REPLACE VIEW booking_details AS
SELECT
    b.id as booking_id,
    b.booking_reference,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.passenger_count,
    b.total_weight_kg,
    b.booking_type,
    b.payment_status,
    b.status as booking_status,
    b.qr_code,
    b.created_at as booked_at,
    f.id as flight_id,
    f.scheduled_date,
    f.scheduled_time,
    r.name as route_name,
    r.origin,
    r.destination,
    r.duration_minutes,
    r.base_price,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'name', p.name,
            'weight_kg', p.weight_kg,
            'seat_number', p.seat_number
        )
    ) as passengers
FROM bookings b
JOIN flights f ON b.flight_id = f.id
JOIN routes r ON f.route_id = r.id
LEFT JOIN passengers p ON b.id = p.booking_id
GROUP BY
    b.id, b.booking_reference, b.customer_name, b.customer_email,
    b.customer_phone, b.passenger_count, b.total_weight_kg,
    b.booking_type, b.payment_status, b.status, b.qr_code,
    b.created_at, f.id, f.scheduled_date, f.scheduled_time,
    r.name, r.origin, r.destination, r.duration_minutes, r.base_price;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE routes IS 'Available helicopter tour routes';
COMMENT ON TABLE flights IS 'Scheduled flights for specific routes and times';
COMMENT ON TABLE bookings IS 'Customer bookings for flights';
COMMENT ON TABLE passengers IS 'Individual passenger details within a booking';
COMMENT ON TABLE helipad_locations IS 'Helipad locations for future expansion';

COMMENT ON FUNCTION update_flight_totals() IS 'Automatically updates flight passenger count and total weight when bookings change';
COMMENT ON FUNCTION generate_booking_reference() IS 'Generates unique booking reference in format HT-YYYYMMDD-XXX';
COMMENT ON VIEW available_flights IS 'Shows all scheduled flights with remaining capacity information';
COMMENT ON VIEW booking_details IS 'Complete booking information including passengers and flight details';
