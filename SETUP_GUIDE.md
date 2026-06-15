# Helicopter Tours Amman - Complete Setup Guide

## Project Overview

A weight-optimized helicopter tour booking system for Amman, Jordan. Built with Next.js, Supabase, and deployed on Vercel.

**Live Demo:** https://heli-tours-git-main-nsour-is-projects.vercel.app

**Repository:** https://github.com/Nsour-IS/Heli-tours

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v3
- **Deployment:** Vercel
- **Version Control:** GitHub

---

## Complete Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Nsour-IS/Heli-tours.git
cd Heli-tours
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

#### A. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Save your credentials

#### B. Run Database Migrations

Go to Supabase Dashboard → SQL Editor and run these files in order:

**Migration 1:** `supabase/migrations/20241002000000_initial_schema.sql`
- Creates core tables (routes, flights, bookings, passengers)
- Sets up triggers for automatic weight calculations
- Creates views for easy querying

**Migration 2:** `supabase/migrations/20241002000001_rls_policies.sql`
- Enables Row Level Security
- Sets up access policies

**Migration 3:** `supabase/migrations/20241002000002_flight_holds.sql`
- Adds temporary seat reservation system
- Creates hold cleanup functions

**Seed Data:** `supabase/seed/demo_data.sql`
- Loads sample routes and flights
- Creates test bookings

#### C. Get API Keys

From Supabase Dashboard → Settings → API:
- Project URL
- anon/public key
- service_role key

### 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Deploy to Vercel

#### A. Connect GitHub Repository
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure build settings:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### B. Add Environment Variables
In Vercel → Settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### C. Deploy
- Vercel auto-deploys on git push
- Manual deploy: `vercel --prod`

---

## Project Structure

```
heli-tours-amman/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Homepage
│   ├── book/                    # Customer booking flow
│   ├── coordinator/             # Staff dashboard
│   ├── booking-confirmation/    # QR code confirmation
│   └── api/                     # API routes
│       ├── flights/             # Flight endpoints
│       ├── bookings/            # Booking endpoints
│       ├── holds/               # Seat hold endpoints
│       └── analytics/           # Analytics endpoint
├── components/                   # React components
│   ├── FlightSelector.tsx       # Flight selection with holds
│   ├── PassengerForm.tsx        # Passenger details form
│   ├── BookingSummary.tsx       # Booking confirmation
│   └── coordinator/             # Dashboard components
│       ├── TodaysFlights.tsx    # Flight management
│       ├── FlightCard.tsx       # Expandable flight cards
│       ├── WalkInBooking.tsx    # Walk-in interface
│       └── Analytics.tsx        # Performance metrics
├── lib/                         # Utilities
│   ├── supabase.ts             # Supabase client config
│   └── types.ts                # TypeScript types
├── supabase/                    # Database files
│   ├── migrations/             # SQL migrations
│   ├── seed/                   # Demo data
│   └── README.md               # Database docs
└── public/                     # Static assets
```

---

## Key Features

### Customer Booking System
- **URL:** `/book`
- Smart booking form with weight validation
- Temporary seat holds (15 minutes)
- Passenger count selection (1-3)
- Real-time capacity checking
- QR code boarding pass
- Booking confirmation emails

### Coordinator Dashboard
- **URL:** `/coordinator`
- Real-time flight management
- Auto-refresh every 30 seconds
- Expandable passenger manifests
- One-click check-in
- Walk-in booking interface
- Analytics dashboard

### Smart Features
- Automatic weight/passenger calculations
- Hold system prevents double-booking
- Auto-cleanup of expired holds
- Row-level security
- Real-time availability updates

---

## Database Schema

### Core Tables

**routes** - Tour routes
- id, name, origin, destination
- duration_minutes, base_price
- description, status

**flights** - Scheduled flights
- id, route_id, scheduled_date, scheduled_time
- max_passengers (3), max_weight_kg (180)
- current_passengers, current_weight_kg
- status (scheduled/confirmed/completed/cancelled)

**bookings** - Customer bookings
- id, flight_id, booking_reference
- customer details (name, email, phone)
- passenger_count, total_weight_kg
- booking_type (online/phone/walkin)
- payment_status, status, qr_code

**passengers** - Individual passengers
- id, booking_id, name, weight_kg
- seat_number

**flight_holds** - Temporary reservations
- id, flight_id, session_id
- passenger_count, expires_at

### Key Functions

**generate_booking_reference()** - Creates unique booking refs (HT-YYYYMMDD-XXX)

**update_flight_totals()** - Auto-updates flight capacity

**cleanup_expired_holds()** - Removes expired holds

**get_flight_available_seats()** - Returns actual available seats

### Views

**available_flights** - Flight availability with holds

**booking_details** - Complete booking info with passengers

---

## API Endpoints

### Flights
- `GET /api/flights` - List available flights
- `GET /api/flights/[id]/bookings` - Get flight bookings

### Bookings
- `POST /api/bookings/validate` - Validate weight/capacity
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/by-reference/[reference]` - Get booking by ref
- `POST /api/bookings/[id]/check-in` - Check in passenger

### Holds
- `POST /api/holds/create` - Create seat hold (15 min)
- `POST /api/holds/release` - Release hold

### Analytics
- `GET /api/analytics?range=today|week|month` - Performance metrics

---

## Important Notes

### Weight Limits
- Maximum 3 passengers per flight
- Maximum 180kg total weight
- Individual passenger: 20-200kg

### Hold System
- 15-minute temporary reservations
- Auto-cleanup on expiry
- Released on booking completion
- Session-based tracking

### Security
- Row Level Security (RLS) enabled
- Customer data encrypted
- Service role for admin operations
- Public access only to active routes/flights

---

## Common Tasks

### Add New Route
```sql
INSERT INTO routes (name, origin, destination, duration_minutes, base_price, description)
VALUES ('New Route', 'Start', 'End', 15, 200, 'Description');
```

### Create Flight Schedule
```sql
INSERT INTO flights (route_id, scheduled_date, scheduled_time, max_passengers, max_weight_kg)
VALUES ('route-id', '2024-10-10', '10:00:00', 3, 180.00);
```

### View Analytics
```sql
SELECT
  COUNT(*) as total_flights,
  AVG(current_passengers::float / max_passengers * 100) as seat_utilization,
  AVG(current_weight_kg / max_weight_kg * 100) as weight_utilization
FROM flights
WHERE scheduled_date >= CURRENT_DATE;
```

### Clean Up Old Data
```sql
-- Remove old holds
SELECT cleanup_expired_holds();

-- Archive completed flights
UPDATE flights
SET status = 'completed'
WHERE scheduled_date < CURRENT_DATE - INTERVAL '7 days';
```

---

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Verify all dependencies: `npm install`
- Clear Next.js cache: `rm -rf .next`

### Database Errors
- Ensure migrations ran in correct order
- Check RLS policies are enabled
- Verify API keys in environment variables

### Holds Not Working
- Run migration 3 (`20241002000002_flight_holds.sql`)
- Check `available_flights` view includes `held_seats`
- Verify session storage in browser

### API Errors
- Check Supabase credentials
- Verify service role key for admin operations
- Check browser console for errors

---

## Backup Strategy

### Code Backup
```bash
# Push to GitHub
git add .
git commit -m "Backup"
git push origin main

# Create backup branch
git checkout -b backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)
```

### Database Backup
From Supabase Dashboard:
1. Settings → Database
2. Download backup
3. Store migrations in version control

### Environment Variables
- Keep `.env.example` updated
- Document all required variables
- Store actual values securely (not in git)

---

## Contact & Support

**Developer:** Mohammad Nsour
**Repository:** https://github.com/Nsour-IS/Heli-tours
**Documentation:** See `PROJECT_BRIEF.md` for full requirements

---

## License

Built as a demo/MVP for helicopter tour operator at CitiMall Business Park, Amman, Jordan.

---

**Last Updated:** October 2, 2024
