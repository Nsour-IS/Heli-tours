# Helicopter Tours Amman - Project Brief

## Executive Summary

A dual-app platform for helicopter tour bookings in Amman, Jordan, solving the critical challenge of weight-based passenger optimization while maximizing flight utilization and safety. Built as a demo/MVP for a prospect client operating from CitiMall Business Park.

---

## Business Context

### Current Operation
- **Location**: Helipad near CitiMall, Business Park area, Amman, Jordan
- **Current Route**: CitiMall → Amman Overview → Madaba → Jordan Valley View
- **Flight Duration**: 12 minutes
- **Helicopter Capacity**: 4 total (1 pilot + 3 passengers)
- **Critical Weight Limit**: 180kg maximum for 3 passengers combined
- **Current Booking Method**: Phone reservations + walk-ins

### Core Problem
The client faces a **weight optimization challenge**:
- Manual weight calculations lead to safety risks
- Frequent underutilization (flying 2 passengers when 3 could safely fit)
- Revenue loss from empty seats
- Poor customer experience (last-minute rejections)
- No systematic way to optimize passenger combinations

**Example Scenario**: 
- Two passengers at 85kg each = 170kg total
- Current system: Rejects 3rd passenger or flies with just 2
- Lost opportunity: Could accommodate 3rd passenger up to 90kg (10kg buffer wasted)

### Business Goals
1. **Primary**: Demonstrate intelligent weight-based booking system
2. **Secondary**: Build scalable architecture for future expansion
3. **Demo Goal**: Show 30-50% improvement in seat utilization
4. **Future Vision**: Expand to heli-taxi service with multiple routes (private/pooled trips)

---

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14+ (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL + Real-time)
- **Deployment**: Vercel
- **Version Control**: GitHub
- **Development**: Claude Code + VS Code

### System Components

#### 1. Customer App (Web - Mobile Responsive)
**Core Features:**
- Smart booking form with weight input
- Real-time availability checking
- Weight optimization suggestions
- Booking confirmation with QR code
- Trip details and itinerary
- Payment integration (demo mode initially)

#### 2. Coordinator Dashboard (Web)
**Core Features:**
- Daily flight schedule view
- Real-time weight distribution per flight
- Passenger manifest management
- Drag-and-drop passenger reallocation
- Walk-in customer quick booking
- Analytics and utilization metrics

---

## Database Schema (Supabase)

### Tables

#### `routes`
```sql
- id (uuid, primary key)
- name (text) -- "Amman Classic Tour"
- origin (text) -- "CitiMall Helipad"
- destination (text) -- "Madaba & Jordan Valley"
- duration_minutes (integer) -- 12
- base_price (decimal)
- description (text)
- status (enum: active, inactive)
- created_at (timestamp)
```

#### `flights`
```sql
- id (uuid, primary key)
- route_id (uuid, foreign key → routes)
- scheduled_date (date)
- scheduled_time (time)
- max_passengers (integer) -- 3
- max_weight_kg (decimal) -- 180.0
- current_passengers (integer) -- calculated
- current_weight_kg (decimal) -- calculated
- status (enum: scheduled, confirmed, completed, cancelled)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `bookings`
```sql
- id (uuid, primary key)
- flight_id (uuid, foreign key → flights)
- booking_reference (text, unique) -- "HT-20241002-001"
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- passenger_count (integer)
- total_weight_kg (decimal)
- booking_type (enum: online, phone, walkin)
- payment_status (enum: pending, confirmed, refunded)
- status (enum: pending, confirmed, checked_in, completed, cancelled)
- qr_code (text) -- for check-in
- created_at (timestamp)
- updated_at (timestamp)
```

#### `passengers`
```sql
- id (uuid, primary key)
- booking_id (uuid, foreign key → bookings)
- name (text)
- weight_kg (decimal)
- seat_number (integer, nullable)
- created_at (timestamp)
```

#### `helipad_locations` (Future expansion)
```sql
- id (uuid, primary key)
- name (text)
- address (text)
- city (text)
- coordinates (point) -- PostGIS
- status (enum: active, inactive)
- created_at (timestamp)
```

---

## Core Algorithm: Weight Optimization Engine

### Booking Request Flow

```javascript
function canAccommodateBooking(flight, newPassengers) {
  const totalNewWeight = newPassengers.reduce((sum, p) => sum + p.weight, 0);
  const currentWeight = flight.current_weight_kg;
  const currentPassengers = flight.current_passengers;
  
  // Check passenger count limit
  if (currentPassengers + newPassengers.length > flight.max_passengers) {
    return {
      canBook: false,
      reason: 'passenger_limit',
      alternatives: findAlternativeFlights(flight, newPassengers)
    };
  }
  
  // Check weight limit
  if (currentWeight + totalNewWeight > flight.max_weight_kg) {
    return {
      canBook: false,
      reason: 'weight_limit',
      remainingCapacity: flight.max_weight_kg - currentWeight,
      alternatives: findAlternativeFlights(flight, newPassengers)
    };
  }
  
  return {
    canBook: true,
    remainingSeats: flight.max_passengers - currentPassengers - newPassengers.length,
    remainingWeight: flight.max_weight_kg - currentWeight - totalNewWeight
  };
}

function findAlternativeFlights(requestedFlight, passengers) {
  // Find flights on same day with capacity
  // Suggest next available slot
  // Calculate private flight option cost
  return alternatives;
}
```

### Smart Suggestions

When a booking cannot be accommodated:
1. **Next Available Slot**: Same route, nearest time
2. **Split Booking**: If 3 passengers don't fit, suggest 2+1 split across time slots
3. **Private Flight**: Calculate cost for exclusive charter
4. **Weight Recommendation**: "If total weight is under Xkg, you can book this slot"

---

## User Flows

### Customer Booking Flow

1. **Landing Page**
   - Hero section with stunning helicopter/Amman imagery
   - "Book Your Flight" CTA
   - Route overview (map visualization)

2. **Booking Form**
   - Select date (calendar with availability indicators)
   - Select time slot (shows available capacity)
   - Number of passengers (1-3)
   - **Weight Input for Each Passenger**
     - Clear privacy message: "Weight info for safety only, never shared"
     - Input validation (realistic ranges)
   - Contact details (name, email, phone)

3. **Availability Check (Real-time)**
   - System calculates if booking fits
   - **Success**: Show confirmation, pricing, payment
   - **Failure**: Show alternatives with reasons
     - "This slot can accommodate up to 2 passengers at your weight"
     - "Next available: 2:00 PM (3 seats available)"
     - "Private flight option: +30% cost"

4. **Payment & Confirmation**
   - Payment details (Stripe/demo mode)
   - Booking confirmation
   - QR code generation
   - Email confirmation

5. **Booking Management**
   - View upcoming trips
   - Modify/cancel (with policy)
   - Check-in instructions

### Coordinator Flow

1. **Dashboard Overview**
   - Today's flights (timeline view)
   - Flight cards showing:
     - Time, route
     - Passenger count (visual: 👤👤👤)
     - Weight gauge (🟢 120/180kg)
     - Status indicators
   
2. **Flight Detail View**
   - Complete passenger manifest
   - Individual passenger weights
   - Check-in status
   - Actions: Add walk-in, reassign, cancel

3. **Walk-in Booking**
   - Quick form: name, phone, passenger count, weights
   - System shows compatible time slots
   - Instant confirmation

4. **Passenger Reallocation**
   - Drag passenger card between flight slots
   - System validates weight limits automatically
   - Auto-sends notification to customer
   - Reason tracking (weather, maintenance, optimization)

5. **Analytics Dashboard**
   - Seat utilization rate (target: >85%)
   - Revenue per flight
   - Weight distribution patterns
   - Booking source breakdown (online/phone/walk-in)
   - Popular time slots

---

## MVP Feature Priority (Phase 1)

### Must Have (Week 1-2)
- [ ] Database schema setup in Supabase
- [ ] Basic Next.js project structure
- [ ] Customer booking form with weight input
- [ ] Weight validation algorithm
- [ ] Flight availability checking
- [ ] Coordinator dashboard (view flights)
- [ ] Basic booking management

### Should Have (Week 3)
- [ ] Real-time updates (Supabase subscriptions)
- [ ] QR code generation
- [ ] Email notifications (basic)
- [ ] Mobile-responsive design
- [ ] Walk-in booking interface
- [ ] Booking modification/cancellation

### Nice to Have (Week 4 - Polish)
- [ ] Advanced analytics
- [ ] Passenger reallocation drag-and-drop
- [ ] Payment integration (demo mode)
- [ ] Route map visualization
- [ ] Customer booking history
- [ ] Automated reminders

---

## Future Expansion Architecture (Phase 2)

### Heli-Taxi Features
- Multiple pickup/dropoff points across Amman
- Private vs pooled trip options
- Dynamic pricing based on distance/demand
- Real-time helicopter tracking
- Route optimization for multiple stops

### Database Additions
```sql
- routes: add waypoints, distance_km, difficulty_level
- helipad_locations: activate and use
- pricing_rules: dynamic pricing logic
- fleet: multiple helicopter management
- pilot_schedules: crew management
```

### Technical Considerations
- Multi-tenancy (if scaling to other cities)
- API for third-party integrations
- Mobile native apps (React Native)
- Advanced analytics/ML for demand prediction

---

## Design Guidelines

### Visual Identity
- **Colors**: Sky blue, gold accents (luxury + trust)
- **Typography**: Modern, clean sans-serif
- **Imagery**: High-quality photos of Amman, helicopter, Jordan landscapes
- **Tone**: Professional yet approachable, emphasizing safety and luxury

### UX Principles
1. **Transparency**: Clear pricing, weight limits, safety info
2. **Trust**: Privacy assurance for weight data
3. **Simplicity**: 3-click booking maximum
4. **Responsiveness**: Real-time feedback on availability
5. **Accessibility**: Mobile-first, easy for all ages

---

## Success Metrics (Demo)

### Quantitative
- **Seat Utilization**: Target 85%+ (from current ~60%)
- **Booking Time**: <2 minutes average
- **Weight Optimization**: 30% more 3-passenger flights
- **Customer Satisfaction**: Mock reviews/testimonials

### Qualitative (Pitch Points)
- "Eliminates manual calculations and human error"
- "Increases revenue by 25-30% through better utilization"
- "Professional system that scales with business growth"
- "Real-time visibility into operations"

---

## Development Roadmap

### Week 1: Foundation
- Day 1-2: Supabase setup, schema creation
- Day 3-4: Next.js project structure, routing
- Day 5-7: Core booking algorithm, API routes

### Week 2: Customer App
- Day 1-3: Booking form UI
- Day 4-5: Weight validation integration
- Day 6-7: Booking confirmation flow

### Week 3: Coordinator Dashboard
- Day 1-3: Dashboard layout, flight list
- Day 4-5: Passenger management
- Day 6-7: Walk-in booking interface

### Week 4: Polish & Demo Prep
- Day 1-2: Real-time features
- Day 3-4: Mobile responsive refinement
- Day 5: Demo data seeding
- Day 6-7: Demo presentation preparation

---

## Demo Presentation Strategy

### Show, Don't Tell
1. **Problem Demo**: Show current manual process (mock scenario)
2. **Solution Demo**: Live booking with weight optimization
3. **Impact Visualization**: Before/after utilization comparison
4. **Coordinator View**: Show operational efficiency

### Key Demo Scenarios

**Scenario A: Optimal Booking**
- 3 passengers: 60kg, 55kg, 60kg = 175kg ✅
- System confirms instantly, shows 5kg buffer remaining

**Scenario B: Smart Alternative**
- 3 passengers: 70kg, 75kg, 65kg = 210kg ❌
- System suggests: 2 passengers now + 1 next slot
- Or: Private flight option

**Scenario C: Coordinator Optimization**
- Shows flight with 2 passengers (140kg)
- Walk-in customer arrives (35kg)
- System identifies can add to existing flight
- Revenue increase highlighted

---

## Risk Mitigation

### Technical Risks
- **Real-time performance**: Use Supabase subscriptions carefully
- **Weight privacy**: Encrypt sensitive data, clear policies
- **Payment integration**: Start with demo mode, add real later

### Business Risks
- **User adoption**: Make system easier than phone booking
- **Data accuracy**: Verify weight input methods (honor system vs. check-in scale)
- **Expansion complexity**: Keep architecture modular

---

## Next Steps

1. **Initialize Project**
   ```bash
   npx create-next-app@latest heli-tours-amman --typescript --tailwind --app
   ```

2. **Setup Supabase**
   - Create project
   - Run schema migrations
   - Configure authentication (optional for MVP)

3. **Development Environment**
   - Configure ESLint, Prettier
   - Setup Git repository
   - Create environment variables template

4. **Start Building**
   - Begin with database schema
   - Build core algorithm
   - Create customer booking flow
   - Develop coordinator dashboard

---

## Contact & Context

**Developer**: Building for Binseren project experience, using Claude Code workflow
**Timeline**: 4-week MVP for prospect demo
**Goal**: Secure client contract by demonstrating value

---

*This brief is a living document. Update as requirements evolve or new features are identified.*