# Team-Sync

A team management application built with Next.js, Supabase, Prisma, and Tailwind CSS.

## Features

- 🔐 **Magic Link Authentication** via Supabase Auth
- 👥 **Organizational Hierarchy** with roles and management structure
- 📋 **Task Management** with assignment tracking
- 🛡️ **Admin Portal** for managing users and roles
- 📱 **Responsive Design** with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **ORM:** Prisma
- **Authentication:** Supabase Auth (Magic Link)

## Getting Started

### 1. Prerequisites

- Node.js 18+ 
- A Supabase account

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon (public) key
3. Go to **Project Settings** → **Database** and copy the connection string

### 3. Environment Variables

Update `.env` with your Supabase credentials:

```env
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"

# Database connection string
DATABASE_URL="postgresql://postgres.your-project-id:password@aws-0-region.pooler.supabase.com:5432/postgres"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database with sample data
npm run prisma:seed
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Users

After seeding, you can log in with any of these emails:

- `ceo@teamsync.com` (CEO - Admin access)
- `director1@teamsync.com` (Director)
- `director2@teamsync.com` (Director)
- `manager1@teamsync.com` (Manager)
- `manager2@teamsync.com` (Manager)
- `associate1@teamsync.com` (Associate)
- `associate2@teamsync.com` (Associate)

## Application Structure

- **`/login`** - Magic link authentication
- **`/dashboard`** - User dashboard showing hierarchy and tasks
- **`/admin`** - Admin portal for managing users (CEO/Admin only)

## Database Schema

### Models

- **Role** - Job roles with hierarchy levels (CEO, Director, Manager, Associate)
- **User** - Team members with role and manager assignments
- **Task** - Work items assigned between users

### Relationships

- Users belong to Roles
- Users can have Managers (self-referential)
- Tasks are assigned from one User to another

## Key Features

### Authentication Flow
- Magic link login via Supabase Auth
- Protected routes with middleware
- Automatic redirects based on auth state

### Dashboard
- View your manager, direct reports, and co-workers
- See assigned tasks with status tracking
- Clean, responsive interface

### Admin Portal
- View all users in a sortable table
- Edit user roles and manager assignments
- Prevent circular reporting relationships
- Real-time updates with Server Actions

## Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:seed  # Seed database with sample data
```

### Project Structure

```
src/
├── app/
│   ├── admin/           # Admin portal
│   ├── auth/            # Auth callback handlers
│   ├── dashboard/       # User dashboard
│   ├── login/           # Login page
│   └── page.tsx         # Root redirect page
├── components/          # Reusable UI components
├── lib/
│   ├── prisma.ts        # Prisma client singleton
│   └── supabase/        # Supabase client utilities
└── middleware.ts        # Route protection
```
