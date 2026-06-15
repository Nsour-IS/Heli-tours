# Documentation Index

**Project:** Helicopter Tours Amman
**Last Updated:** October 17, 2025

Welcome to the complete documentation for the Helicopter Tours Amman booking system. This index will guide you to the right documentation for your needs.

---

## Quick Start

**New to the project?** Start here:
1. Read [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) - Understand the business context and requirements
2. Follow [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Get the project running locally
3. Review [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Understand the data model

**Need to restore from backup?**
→ See [`BACKUP_README.md`](BACKUP_README.md)

**Building features or integrations?**
→ See [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)

---

## Documentation Files

### 1. PROJECT_BRIEF.md
**Purpose:** Complete project overview and requirements
**Audience:** Developers, stakeholders, project managers
**Last Updated:** October 17, 2025

**Contains:**
- Executive summary and business context
- Core problem: Weight-based passenger optimization
- Technical architecture and tech stack
- Database schema overview
- User flows (customer and coordinator)
- MVP feature priority and roadmap
- Future expansion plans
- Demo presentation strategy

**When to read:**
- Starting work on the project
- Onboarding new team members
- Planning new features
- Preparing client demonstrations

---

### 2. SETUP_GUIDE.md
**Purpose:** Step-by-step setup and deployment instructions
**Audience:** Developers
**Last Updated:** October 2, 2024

**Contains:**
- Complete setup instructions
- Supabase configuration steps
- Environment variable setup
- Local development workflow
- Vercel deployment guide
- Project structure overview
- Key features summary
- Troubleshooting common issues
- Common maintenance tasks

**When to read:**
- Setting up development environment
- Deploying to production
- Troubleshooting setup issues
- Learning project structure

---

### 3. DATABASE_SCHEMA.md
**Purpose:** Comprehensive database documentation
**Audience:** Developers, database administrators
**Last Updated:** October 17, 2025

**Contains:**
- Complete table schemas with all columns
- Entity relationship diagrams
- Database functions and triggers
- Views for common queries
- Row Level Security policies
- Constraints and validation rules
- Indexes and performance optimization
- Sample queries and maintenance tasks
- Migration history

**When to read:**
- Writing database queries
- Creating new features that touch the database
- Optimizing performance
- Understanding data relationships
- Troubleshooting data issues

---

### 4. API_DOCUMENTATION.md
**Purpose:** Complete REST API reference
**Audience:** Frontend developers, API consumers
**Last Updated:** October 17, 2025

**Contains:**
- All 9 API endpoints with detailed specs
- Request/response examples
- Authentication requirements
- Error handling guide
- Data type definitions
- Best practices for API usage
- Testing examples
- Performance considerations

**Endpoints Documented:**
1. GET `/api/flights` - List available flights
2. POST `/api/bookings/validate` - Validate booking capacity
3. POST `/api/bookings/create` - Create new booking
4. GET `/api/bookings/by-reference/[ref]` - Get booking details
5. GET `/api/flights/[id]/bookings` - Get flight bookings
6. POST `/api/bookings/[id]/check-in` - Check-in passenger
7. POST `/api/holds/create` - Create seat hold
8. POST `/api/holds/release` - Release seat hold
9. GET `/api/analytics` - Get performance metrics

**When to read:**
- Building frontend features
- Integrating with the API
- Debugging API issues
- Understanding request/response formats
- Learning the booking flow

---

### 5. BACKUP_README.md
**Purpose:** Backup and disaster recovery guide
**Audience:** DevOps, system administrators, developers
**Last Updated:** October 17, 2025

**Contains:**
- Backup file locations and contents
- Complete restoration instructions (3 methods)
- Database backup and restore procedures
- Environment variable recovery
- Verification checklist
- Recovery scenarios and solutions
- Backup schedule recommendations
- Version information

**When to read:**
- Creating backups
- Restoring from backup
- Disaster recovery situations
- Setting up backup schedules
- Moving to new infrastructure

---

## Additional Files

### README.md
**Purpose:** GitHub repository landing page (if exists)
**Contains:** Quick project overview and links to detailed docs

### .env.example
**Purpose:** Environment variable template
**Contains:** Required environment variables with setup instructions

### package.json
**Purpose:** Node.js dependencies and scripts
**Contains:** All project dependencies and npm scripts

---

## Project Structure

```
heli-tours-amman/
├── Documentation (You are here!)
│   ├── DOCUMENTATION_INDEX.md        ← This file
│   ├── PROJECT_BRIEF.md              ← Requirements & overview
│   ├── SETUP_GUIDE.md                ← Setup instructions
│   ├── DATABASE_SCHEMA.md            ← Database documentation
│   ├── API_DOCUMENTATION.md          ← API reference
│   └── BACKUP_README.md              ← Backup & restore guide
│
├── Source Code
│   ├── app/                          ← Next.js App Router
│   │   ├── page.tsx                  ← Homepage
│   │   ├── layout.tsx                ← Root layout
│   │   ├── book/                     ← Customer booking flow
│   │   ├── coordinator/              ← Staff dashboard
│   │   └── api/                      ← 9 API endpoints
│   ├── components/                   ← React components
│   ├── lib/                          ← Utilities & types
│   └── public/                       ← Static assets
│
├── Database
│   └── supabase/
│       ├── migrations/               ← 3 SQL migration files
│       └── seed/                     ← Demo data
│
└── Configuration
    ├── .env.example                  ← Environment template
    ├── .env.local                    ← Your credentials (not in git)
    ├── package.json                  ← Dependencies
    ├── tsconfig.json                 ← TypeScript config
    └── tailwind.config.ts            ← Tailwind config
```

---

## Common Tasks & Where to Look

### Setting Up Locally
1. [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Steps 1-5
2. [`.env.example`](.env.example) - Create `.env.local`
3. [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Understand the schema

### Creating a New Feature
1. [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) - Check if it aligns with requirements
2. [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Review relevant tables
3. [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Plan API changes

### Debugging Issues
1. [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Check troubleshooting section
2. [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Verify data structure
3. [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Check API contracts

### Deploying to Production
1. [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Deployment section
2. [`BACKUP_README.md`](BACKUP_README.md) - Create backup first
3. Environment variables - Update in Vercel

### Restoring from Backup
1. [`BACKUP_README.md`](BACKUP_README.md) - Follow restoration steps
2. [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Verify setup after restore

### Understanding the Database
1. [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Complete schema reference
2. Migration files in `supabase/migrations/` - Actual SQL

### Using the API
1. [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Endpoint reference
2. [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Data structure

### Onboarding New Developers
**Day 1:**
- Read [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) - Understand the "why"
- Follow [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Get running locally

**Day 2:**
- Study [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Learn data model
- Review [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Understand API

**Day 3:**
- Explore codebase with docs as reference
- Try making a test booking end-to-end

---

## Documentation Maintenance

### Keeping Docs Updated

**When to update documentation:**
- After adding/modifying database tables → Update `DATABASE_SCHEMA.md`
- After adding/changing API endpoints → Update `API_DOCUMENTATION.md`
- After changing setup process → Update `SETUP_GUIDE.md`
- After major feature additions → Update `PROJECT_BRIEF.md`
- After creating backups → Update `BACKUP_README.md`

**Documentation review schedule:**
- Weekly: Check for outdated information
- Monthly: Full documentation audit
- Per release: Update version numbers and dates

---

## Technology Stack Reference

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript 5.9.3
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 3.4.18

### Backend
- **Database:** PostgreSQL via Supabase
- **API:** Next.js API Routes
- **Authentication:** Row Level Security (RLS)
- **Real-time:** Supabase Realtime subscriptions

### Deployment
- **Hosting:** Vercel
- **Database:** Supabase Cloud
- **Version Control:** GitHub

### Development Tools
- **Package Manager:** npm
- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with Next.js config

---

## Key Concepts

### Weight-Based Optimization
The core business logic that validates bookings based on both passenger count (max 3) and total weight (max 180kg). See:
- [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) - Business context
- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Validation endpoint
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - Constraints

### Flight Holds System
15-minute temporary seat reservations to prevent double-booking during checkout. See:
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - `flight_holds` table
- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Hold endpoints
- Migration 3: `20241002000002_flight_holds.sql`

### Booking Reference System
Unique references in format HT-YYYYMMDD-XXX for easy customer lookup. See:
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - `generate_booking_reference()` function
- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Booking endpoints

### Row Level Security (RLS)
Database-level security that controls data access. See:
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) - RLS policies section
- Migration 2: `20241002000001_rls_policies.sql`

---

## External Resources

### Live Deployments
- **Production:** https://heli-tours-git-main-nsour-is-projects.vercel.app
- **Coordinator Dashboard:** https://heli-tours-git-main-nsour-is-projects.vercel.app/coordinator

### Repositories & Dashboards
- **GitHub:** https://github.com/Nsour-IS/Heli-tours
- **Vercel Dashboard:** https://vercel.com
- **Supabase Dashboard:** https://supabase.com

### Official Documentation
- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

## Support & Contact

**Developer:** Mohammad Nsour

**For Questions About:**
- Business requirements → See [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md)
- Setup issues → See [`SETUP_GUIDE.md`](SETUP_GUIDE.md)
- Database queries → See [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md)
- API usage → See [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
- Backup/restore → See [`BACKUP_README.md`](BACKUP_README.md)

**Found an issue?** Check the troubleshooting sections in the relevant documentation first.

---

## Version History

### v1.1 - October 17, 2025
- Added comprehensive documentation suite
- Created `DATABASE_SCHEMA.md`
- Created `API_DOCUMENTATION.md`
- Created `BACKUP_README.md`
- Created `DOCUMENTATION_INDEX.md`
- Added flight holds system (Migration 3)

### v1.0 - October 2, 2024
- Initial release
- Core booking system
- Coordinator dashboard
- Basic documentation

---

## Contributing

When contributing to this project:

1. **Read the docs first** - Understand existing architecture
2. **Update docs with your changes** - Keep documentation current
3. **Follow existing patterns** - Maintain consistency
4. **Test thoroughly** - Verify functionality
5. **Update version history** - Document significant changes

---

**Last Updated:** October 17, 2025

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                 HELICOPTER TOURS AMMAN                      │
│                  Documentation Quick Ref                     │
└─────────────────────────────────────────────────────────────┘

📋 PROJECT OVERVIEW     → PROJECT_BRIEF.md
🚀 SETUP & DEPLOY       → SETUP_GUIDE.md
🗄️  DATABASE            → DATABASE_SCHEMA.md
🔌 API REFERENCE        → API_DOCUMENTATION.md
💾 BACKUP & RESTORE     → BACKUP_README.md
📚 THIS INDEX           → DOCUMENTATION_INDEX.md

🌐 Live Site:            heli-tours-git-main-nsour-is-projects.vercel.app
📦 GitHub:              github.com/Nsour-IS/Heli-tours
🔑 Supabase:            rmvvyrjsiuzjejtwfkjf.supabase.co

📧 Developer:           Mohammad Nsour
📅 Last Updated:        October 17, 2025
🏷️  Version:            1.1

┌─────────────────────────────────────────────────────────────┐
│                   QUICK COMMANDS                            │
└─────────────────────────────────────────────────────────────┘

npm run dev          → Start development server
npm run build        → Build for production
npm run start        → Start production server
npm run lint         → Run ESLint

git status           → Check git status
git add .            → Stage all changes
git commit -m "..."  → Commit changes
git push             → Push to GitHub

└─────────────────────────────────────────────────────────────┘
```
