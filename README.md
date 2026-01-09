# EventFlow - Event Management Application

## Overview

EventFlow is a full-stack event management application that allows users to browse events and register as attendees, while administrators can create, publish, and manage events. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, EventDetails, NotFound)
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/` for data fetching and utilities
- UI primitives in `client/src/components/ui/` (shadcn/ui)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Style**: REST endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod with drizzle-zod integration
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage

The backend follows a modular structure:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database access layer (IStorage interface pattern)
- `server/db.ts` - Database connection configuration
- `shared/schema.ts` - Drizzle schema definitions shared between frontend and backend
- `shared/routes.ts` - Type-safe API route definitions with Zod schemas

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Implementation**: Located in `server/replit_integrations/auth/`
- **User Roles**: Admin and User roles with role-based access control

### Database Schema
Three main tables:
1. **users** - User profiles with Replit Auth integration (id, email, username, role, profile info)
2. **events** - Event data (title, description, date, location, capacity, isPublished, createdById)
3. **attendees** - Event registrations linking users to events
4. **sessions** - Session storage for authentication (required for Replit Auth)

### Build System
- Development: `tsx` for TypeScript execution with Vite dev server
- Production: Custom build script using esbuild for server bundling and Vite for client
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Query builder and schema management
- **connect-pg-simple**: Session storage in PostgreSQL

### Authentication
- **Replit Auth**: OpenID Connect provider via `openid-client`
- **Passport.js**: Authentication middleware
- **express-session**: Session management

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `ISSUER_URL` - Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID` - Replit environment identifier

### Key Frontend Libraries
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI primitives
- `framer-motion` - Animation library
- `date-fns` - Date formatting
- `lucide-react` - Icon library
- `react-hook-form` with `@hookform/resolvers` - Form handling
