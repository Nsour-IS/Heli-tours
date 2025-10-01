-- =====================================================
-- SEED DATA FOR DEMO/TESTING
-- =====================================================

-- This seed file creates realistic demo data for the helicopter tour booking system
-- Run this after applying the schema migrations

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE passengers CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE flights CASCADE;
TRUNCATE TABLE routes CASCADE;
TRUNCATE TABLE helipad_locations CASCADE;

-- =====================================================
-- ROUTES
-- =====================================================

INSERT INTO routes (id, name, origin, destination, duration_minutes, base_price, description, status) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Amman Classic Tour',
    'CitiMall Helipad',
    'Madaba & Jordan Valley View',
    12,
    150.00,
    'Experience breathtaking aerial views of Amman, historic Madaba mosaics, and the stunning Jordan Valley. Our signature 12-minute journey showcases the best of Jordan''s capital and surrounding landscapes.',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Dead Sea Sunset Flight',
    'CitiMall Helipad',
    'Dead Sea Panorama',
    20,
    250.00,
    'Witness the magical Dead Sea at sunset from above. This extended flight takes you over the lowest point on Earth with spectacular views of the salt formations and surrounding mountains.',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Petra Express Preview',
    'CitiMall Helipad',
    'Wadi Musa Overview',
    45,
    450.00,
    'Get a bird''s eye preview of the Rose City. This exclusive flight takes you over the dramatic desert landscapes leading to Petra, perfect for planning your ground visit.',
    'inactive'
);

-- =====================================================
-- HELIPAD LOCATIONS (Future expansion)
-- =====================================================

INSERT INTO helipad_locations (id, name, address, city, latitude, longitude, status) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    'CitiMall Business Park',
    'Business Park, King Abdullah II Street',
    'Amman',
    31.9522,
    35.9256,
    'active'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Dead Sea Resort Zone',
    'Dead Sea Road, Tourist Area',
    'Dead Sea',
    31.5590,
    35.4732,
    'inactive'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Queen Alia Airport VIP',
    'Queen Alia International Airport',
    'Amman',
    31.7226,
    35.9932,
    'inactive'
);

-- =====================================================
-- FLIGHTS - Next 7 days schedule
-- =====================================================

-- Today's flights
INSERT INTO flights (id, route_id, scheduled_date, scheduled_time, max_passengers, max_weight_kg, status) VALUES
-- Morning slots
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '09:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '10:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '11:00:00', 3, 180.00, 'scheduled'),
-- Afternoon slots
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '14:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '15:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '16:00:00', 3, 180.00, 'scheduled'),
-- Evening slot
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '17:00:00', 3, 180.00, 'scheduled');

-- Tomorrow's flights
INSERT INTO flights (id, route_id, scheduled_date, scheduled_time, max_passengers, max_weight_kg, status) VALUES
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '09:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '10:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '11:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '14:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '15:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '16:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '1 day', '17:30:00', 3, 180.00, 'scheduled');

-- Day after tomorrow
INSERT INTO flights (id, route_id, scheduled_date, scheduled_time, max_passengers, max_weight_kg, status) VALUES
('770e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '2 days', '09:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '2 days', '10:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '2 days', '11:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 3, 180.00, 'scheduled'),
('770e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '2 days', '15:00:00', 3, 180.00, 'scheduled');

-- =====================================================
-- SAMPLE BOOKINGS
-- =====================================================

-- Booking 1: Family of 3 (optimal weight)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    'HT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001',
    'Ahmad Khalil',
    'ahmad.khalil@email.com',
    '+962791234567',
    3,
    175.00,
    'online',
    'confirmed',
    'confirmed',
    'QR-HT-001-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Ahmad Khalil', 75.00, 1),
('880e8400-e29b-41d4-a716-446655440001', 'Layla Khalil', 55.00, 2),
('880e8400-e29b-41d4-a716-446655440001', 'Omar Khalil', 45.00, 3);

-- Booking 2: Couple (underutilized - room for 1 more)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440002',
    '770e8400-e29b-41d4-a716-446655440002',
    'HT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-002',
    'Sarah Mitchell',
    'sarah.mitchell@email.com',
    '+962792345678',
    2,
    130.00,
    'online',
    'confirmed',
    'confirmed',
    'QR-HT-002-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440002', 'Sarah Mitchell', 62.00, 1),
('880e8400-e29b-41d4-a716-446655440002', 'James Mitchell', 68.00, 2);

-- Booking 3: Solo traveler (great optimization opportunity)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440003',
    '770e8400-e29b-41d4-a716-446655440003',
    'HT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-003',
    'Mohammed Hassan',
    'mohammed.hassan@email.com',
    '+962793456789',
    1,
    70.00,
    'phone',
    'confirmed',
    'confirmed',
    'QR-HT-003-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440003', 'Mohammed Hassan', 70.00, 1);

-- Booking 4: Walk-in booking (2 passengers)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440004',
    '770e8400-e29b-41d4-a716-446655440004',
    'HT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-004',
    'Fatima Al-Rashid',
    'fatima.alrashid@email.com',
    '+962794567890',
    2,
    115.00,
    'walkin',
    'confirmed',
    'checked_in',
    'QR-HT-004-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440004', 'Fatima Al-Rashid', 58.00, 1),
('880e8400-e29b-41d4-a716-446655440004', 'Zainab Al-Rashid', 57.00, 2);

-- Booking 5: Tomorrow's booking (pending payment)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440005',
    '770e8400-e29b-41d4-a716-446655440008',
    'HT-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYYMMDD') || '-001',
    'David Cohen',
    'david.cohen@email.com',
    '+962795678901',
    3,
    178.00,
    'online',
    'pending',
    'pending',
    'QR-HT-005-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440005', 'David Cohen', 72.00, NULL),
('880e8400-e29b-41d4-a716-446655440005', 'Rachel Cohen', 58.00, NULL),
('880e8400-e29b-41d4-a716-446655440005', 'Noah Cohen', 48.00, NULL);

-- Booking 6: Cancelled booking (should not affect flight totals)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440006',
    '770e8400-e29b-41d4-a716-446655440005',
    'HT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-005',
    'John Smith',
    'john.smith@email.com',
    '+962796789012',
    2,
    150.00,
    'online',
    'refunded',
    'cancelled',
    'QR-HT-006-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440006', 'John Smith', 80.00, NULL),
('880e8400-e29b-41d4-a716-446655440006', 'Jane Smith', 70.00, NULL);

-- Booking 7: Dead Sea sunset flight (tomorrow)
INSERT INTO bookings (id, flight_id, booking_reference, customer_name, customer_email, customer_phone, passenger_count, total_weight_kg, booking_type, payment_status, status, qr_code) VALUES
(
    '880e8400-e29b-41d4-a716-446655440007',
    '770e8400-e29b-41d4-a716-446655440014',
    'HT-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYYMMDD') || '-002',
    'Noor Abdullah',
    'noor.abdullah@email.com',
    '+962797890123',
    2,
    125.00,
    'online',
    'confirmed',
    'confirmed',
    'QR-HT-007-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYYMMDD')
);

INSERT INTO passengers (booking_id, name, weight_kg, seat_number) VALUES
('880e8400-e29b-41d4-a716-446655440007', 'Noor Abdullah', 60.00, 1),
('880e8400-e29b-41d4-a716-446655440007', 'Karim Abdullah', 65.00, 2);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check flight totals are calculated correctly
SELECT
    f.scheduled_date,
    f.scheduled_time,
    f.current_passengers,
    f.current_weight_kg,
    f.max_passengers - f.current_passengers as remaining_seats,
    f.max_weight_kg - f.current_weight_kg as remaining_weight
FROM flights f
WHERE f.scheduled_date >= CURRENT_DATE
ORDER BY f.scheduled_date, f.scheduled_time;

-- Check available flights view
SELECT
    route_name,
    scheduled_date,
    scheduled_time,
    current_passengers,
    remaining_seats,
    ROUND(current_weight_kg::numeric, 2) as current_weight,
    ROUND(remaining_weight_kg::numeric, 2) as remaining_weight,
    availability_level
FROM available_flights
ORDER BY scheduled_date, scheduled_time
LIMIT 10;

-- Check booking details view
SELECT
    booking_reference,
    customer_name,
    scheduled_date,
    scheduled_time,
    route_name,
    passenger_count,
    total_weight_kg,
    booking_status
FROM booking_details
ORDER BY scheduled_date, scheduled_time;

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================

SELECT
    'Total Routes' as metric,
    COUNT(*)::text as value
FROM routes WHERE status = 'active'
UNION ALL
SELECT
    'Total Upcoming Flights',
    COUNT(*)::text
FROM flights WHERE scheduled_date >= CURRENT_DATE
UNION ALL
SELECT
    'Total Confirmed Bookings',
    COUNT(*)::text
FROM bookings WHERE status NOT IN ('cancelled')
UNION ALL
SELECT
    'Total Passengers Booked',
    SUM(passenger_count)::text
FROM bookings WHERE status NOT IN ('cancelled')
UNION ALL
SELECT
    'Average Seat Utilization',
    ROUND(AVG(current_passengers::numeric / max_passengers::numeric * 100), 2)::text || '%'
FROM flights
WHERE scheduled_date >= CURRENT_DATE
AND current_passengers > 0;
