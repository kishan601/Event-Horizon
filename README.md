# 🌊 EventFlow - Modern Event Management

EventFlow is a high-performance, full-stack event management platform designed for seamless event discovery and administrative control. Built with a focus on user experience and real-time data integrity.

---

## ✨ Key Features

### 👤 For Attendees
- **Universal Discovery**: Browse upcoming events without needing an account.
- **Seamless Registration**: Quick sign-up for events with instant confirmation.
- **Real-time Availability**: Live tracking of event capacity and remaining spots.
- **Modern UI**: Smooth animations and responsive layout for all devices.

### 🛡️ For Administrators
- **Full Lifecycle Management**: Create, edit, and manage events from a unified dashboard.
- **Publishing Control**: Draft mode support for perfecting event details before going live.
- **Attendee Oversight**: Monitor registration lists for every event.
- **Capacity Guard**: Automated prevention of over-booking.

---

## 🚀 Tech Stack

### Frontend (Modern SPA)
- **React 18** - Component-based UI logic.
- **TypeScript** - Type safety across the interface.
- **Wouter** - Minimalist, high-performance routing.
- **TanStack Query (v5)** - Intelligent server state management and caching.
- **Framer Motion** - Fluid micro-interactions and transitions.
- **Tailwind CSS** - Utility-first styling with custom design tokens.
- **Lucide React** - Beautiful, consistent iconography.

### Backend (Robust & Scalable)
- **Node.js & Express** - Efficient middleware-based API architecture.
- **PostgreSQL** - Reliable relational data persistence.
- **Drizzle ORM** - Type-safe database interactions with SQL-like flexibility.
- **Passport.js** - Flexible authentication middleware.
- **Zod** - Schema-first validation for API requests and database models.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database instance

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create your environment variables in the Replit Secrets tab or a local `.env` file:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `SESSION_SECRET`: A secure string for session encryption.

### Database Initialization
Push the schema to your database:
```bash
npm run db:push
```

### Development
Start the concurrent development servers (Vite + Express):
```bash
npm run dev
```

---

## 📂 Project Architecture

```text
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI & Logic components
│   │   ├── hooks/         # Custom React hooks (Auth, Events)
│   │   ├── lib/           # Utility functions & API clients
│   │   └── pages/         # Top-level route components
├── server/                # Express Backend
│   ├── auth/              # Authentication strategy configuration
│   ├── db.ts              # Database connection setup
│   ├── routes.ts          # API endpoint definitions
│   └── storage.ts         # Data access layer (IStorage)
├── shared/                # Universal Code
│   ├── schema.ts          # Drizzle/Zod data models
│   └── routes.ts          # Shared API route constants
└── package.json           # Project dependencies & scripts
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
