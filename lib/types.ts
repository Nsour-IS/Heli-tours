// Database types
export type RouteStatus = 'active' | 'inactive';
export type FlightStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type BookingType = 'online' | 'phone' | 'walkin';
export type PaymentStatus = 'pending' | 'confirmed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  base_price: number;
  description: string | null;
  status: RouteStatus;
  created_at: string;
}

export interface Flight {
  id: string;
  route_id: string;
  scheduled_date: string;
  scheduled_time: string;
  max_passengers: number;
  max_weight_kg: number;
  current_passengers: number;
  current_weight_kg: number;
  status: FlightStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  flight_id: string;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  passenger_count: number;
  total_weight_kg: number;
  booking_type: BookingType;
  payment_status: PaymentStatus;
  status: BookingStatus;
  qr_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Passenger {
  id: string;
  booking_id: string;
  name: string;
  weight_kg: number;
  seat_number: number | null;
  created_at: string;
}

export interface AvailableFlight extends Flight {
  route_name: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  base_price: number;
  remaining_seats: number;
  held_seats: number;
  actual_available_seats: number;
  remaining_weight_kg: number;
  availability_level: 'high' | 'low' | 'full' | 'none';
}

export interface FlightHold {
  id: string;
  flight_id: string;
  session_id: string;
  passenger_count: number;
  expires_at: string;
  created_at: string;
}

export interface BookingDetail extends Booking {
  scheduled_date: string;
  scheduled_time: string;
  route_name: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  base_price: number;
  passengers: Array<{
    name: string;
    weight_kg: number;
    seat_number: number | null;
  }>;
}

// Form types
export interface PassengerInput {
  name: string;
  weight_kg: number;
}

export interface BookingFormData {
  flight_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  passengers: PassengerInput[];
}

// API Response types
export interface BookingCheckResult {
  canBook: boolean;
  reason?: 'passenger_limit' | 'weight_limit';
  remainingCapacity?: number;
  remainingSeats?: number;
  remainingWeight?: number;
  alternatives?: AvailableFlight[];
}
