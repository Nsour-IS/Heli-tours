# Helicopter Tours Amman - Backup & Restoration Guide

**Backup Created:** October 17, 2025

## Contents

This backup contains the complete Helicopter Tours Amman booking system including:
- Full source code (Next.js 15 + TypeScript)
- Database schema and migrations (Supabase/PostgreSQL)
- Configuration files
- Documentation

---

## Backup Files

### 1. Code Backup
**Location:** `../heli-tours-amman-backup-YYYYMMDD-HHMMSS.zip`
**Size:** ~77KB (source code only, excludes node_modules)
**Contents:**
- All application source code
- Database migrations
- Configuration files (excluding sensitive .env.local)
- Documentation files

### 2. GitHub Repository
**URL:** https://github.com/Nsour-IS/Heli-tours
**Branch:** main
**Latest Commit:** Fix API route conflict between [id] and [reference]

### 3. Live Deployment
**URL:** https://heli-tours-git-main-nsour-is-projects.vercel.app
**Platform:** Vercel
**Status:** Active

### 4. Database
**Platform:** Supabase
**URL:** https://rmvvyrjsiuzjejtwfkjf.supabase.co
**Migrations:** 3 files in `/supabase/migrations/`
**Status:** Active with RLS enabled

---

## Restoration Instructions

### Option 1: Restore from ZIP Backup

1. **Extract the backup:**
   ```bash
   unzip heli-tours-amman-backup-YYYYMMDD-HHMMSS.zip -d heli-tours-amman
   cd heli-tours-amman
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Setup database:**
   - Go to Supabase Dashboard → SQL Editor
   - Run migrations in order:
     - `supabase/migrations/20241002000000_initial_schema.sql`
     - `supabase/migrations/20241002000001_rls_policies.sql`
     - `supabase/migrations/20241002000002_flight_holds.sql`
   - Optionally run seed data: `supabase/seed/demo_data.sql`

5. **Run development server:**
   ```bash
   npm run dev
   ```

### Option 2: Clone from GitHub

1. **Clone repository:**
   ```bash
   git clone https://github.com/Nsour-IS/Heli-tours.git
   cd Heli-tours
   ```

2. **Follow steps 2-5 from Option 1**

### Option 3: Fork from Vercel

1. Go to Vercel Dashboard
2. Import from existing deployment
3. Fork the project
4. Update environment variables
5. Deploy

---

## Database Backup & Restore

### Manual Database Export

From Supabase Dashboard:
1. Navigate to Settings → Database
2. Click "Download backup"
3. Save SQL dump file

### Restore Database

```bash
# Using Supabase CLI
supabase db reset

# Or manually run migrations
psql -h your-host -U your-user -d your-db -f supabase/migrations/20241002000000_initial_schema.sql
psql -h your-host -U your-user -d your-db -f supabase/migrations/20241002000001_rls_policies.sql
psql -h your-host -U your-user -d your-db -f supabase/migrations/20241002000002_flight_holds.sql
```

### Database Schema Backup

All schema changes are version-controlled in:
- `/supabase/migrations/` - All migration files
- Database structure is fully reproducible

---

## Environment Variables

**Required variables** (create `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Security Note:** Never commit `.env.local` to git. Current backup excludes this file.

To get your credentials:
1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Copy the values

---

## Verification Checklist

After restoration, verify:

- [ ] Application runs: `npm run dev` works without errors
- [ ] Database connection: Homepage loads flights
- [ ] Booking system: Can create a test booking
- [ ] Coordinator dashboard: Access `/coordinator` route
- [ ] API endpoints: All 9 endpoints respond correctly
- [ ] Environment variables: All 3 required vars are set

---

## Project Structure Reference

```
heli-tours-amman/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   ├── book/                # Customer booking
│   ├── coordinator/         # Staff dashboard
│   ├── booking-confirmation/# Confirmation pages
│   └── api/                 # 9 API endpoints
├── components/              # React components
│   ├── FlightSelector.tsx
│   ├── PassengerForm.tsx
│   ├── BookingSummary.tsx
│   └── coordinator/         # Dashboard components
├── lib/                     # Utilities
│   ├── supabase.ts         # DB client
│   └── types.ts            # TypeScript types
├── supabase/               # Database files
│   ├── migrations/         # 3 SQL migration files
│   └── seed/              # Demo data
├── public/                 # Static assets
└── Documentation files     # *.md files
```

---

## Backup Schedule Recommendations

### Code Backups
- **Git commits:** After every significant change (already doing)
- **Git pushes:** Daily to GitHub (already doing)
- **Tagged releases:** Create git tags for major versions
- **ZIP archives:** Weekly or before major changes

### Database Backups
- **Supabase automatic:** Enabled by default
- **Manual exports:** Before schema changes
- **Migration files:** Always commit to git (already doing)

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
git archive --format=zip --output="../heli-tours-backup-$DATE.zip" HEAD
echo "Backup created: heli-tours-backup-$DATE.zip"
```

Run weekly:
```bash
chmod +x backup.sh
./backup.sh
```

---

## Recovery Scenarios

### Scenario 1: Lost Local Files
**Solution:** Clone from GitHub or extract ZIP backup

### Scenario 2: Database Corruption
**Solution:** Re-run migrations from scratch
```bash
# Drop all tables and re-run migrations
# In Supabase SQL Editor, drop schema then run migrations
```

### Scenario 3: Deployment Issues
**Solution:** Redeploy from GitHub to Vercel
- Vercel auto-deploys from main branch
- Manual trigger available in Vercel dashboard

### Scenario 4: Environment Variables Lost
**Solution:** Retrieve from Supabase Dashboard → Settings → API

### Scenario 5: Complete Disaster Recovery
**Steps:**
1. Clone/extract code backup
2. Create new Supabase project
3. Run all migrations
4. Deploy to Vercel
5. Update environment variables
6. Verify all functionality

**Time estimate:** 30-60 minutes

---

## Version Information

### Technology Stack
- **Framework:** Next.js 15.5.4
- **React:** 19.2.0
- **TypeScript:** 5.9.3
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 3.4.18
- **Deployment:** Vercel

### Database Schema Version
- **Migration 1:** Initial schema (v1.0)
- **Migration 2:** RLS policies (v1.0)
- **Migration 3:** Flight holds system (v1.1)

### Current Features
- Weight-optimized booking system
- 15-minute seat hold mechanism
- Real-time coordinator dashboard
- QR code boarding passes
- Walk-in booking interface
- Analytics dashboard

---

## Support & Contacts

**Developer:** Mohammad Nsour
**Repository:** https://github.com/Nsour-IS/Heli-tours
**Documentation:** See `PROJECT_BRIEF.md` for full requirements

**Key Documentation Files:**
- `PROJECT_BRIEF.md` - Complete project requirements
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DATABASE_SCHEMA.md` - Database documentation (to be created)
- `API_DOCUMENTATION.md` - API reference (to be created)

---

## Next Steps After Restoration

1. Update dependencies: `npm update`
2. Run security audit: `npm audit fix`
3. Test all features thoroughly
4. Update environment variables if using new Supabase project
5. Configure new Vercel deployment if needed
6. Review and update documentation

---

**Last Updated:** October 17, 2025
**Backup Status:** ✅ Complete and verified
