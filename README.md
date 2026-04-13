# FocusBoard

**Disclaimer:** This project is created by GLM-5.1 using one single prompt just for testing purpose.

A polished full-stack productivity app for managing personal tasks and deep-work sessions. Built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Dashboard** — Productivity stats, weekly focus chart, today's tasks, upcoming & completed tasks
- **Task Management** — Create, edit, delete, reorder with drag-and-drop; filter by status, priority, tags
- **Focus Timer** — Pomodoro-style timer with customizable focus/break durations and session history
- **Notes Panel** — Quick notes with autosave, linkable to tasks
- **Authentication** — Sign up, login, logout with protected routes (NextAuth.js)
- **Dark/Light Mode** — Elegant theme switching with system preference detection
- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Command Palette** — Quick navigation with `⌘K` / `Ctrl+K`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI Components | Radix UI, shadcn/ui-inspired custom components |
| Backend | Next.js API Routes |
| Database | PostgreSQL with Prisma ORM |
| Auth | NextAuth.js (Credentials provider) |
| Charts | Custom SVG visualizations |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally or via Docker)

### Setup

1. **Clone and install:**
   ```bash
   cd focusboard
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your PostgreSQL connection string and a random NextAuth secret.

3. **Set up the database:**
   ```bash
   npm run db:setup
   ```
   This runs `prisma db push` (creates tables) and the seed script.

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Email | Password |
|-------|----------|
| `demo@focusboard.com` | `password123` |

## Project Structure

```
focusboard/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script with sample data
├── src/
│   ├── app/
│   │   ├── (app)/           # Protected app pages
│   │   │   ├── dashboard/   # Dashboard page
│   │   │   ├── tasks/       # Tasks page
│   │   │   ├── focus/       # Focus timer page
│   │   │   └── notes/       # Notes page
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # NextAuth + registration
│   │   │   ├── tasks/       # Task CRUD + reorder
│   │   │   ├── focus/       # Focus sessions
│   │   │   ├── notes/       # Notes CRUD
│   │   │   └── stats/       # Dashboard stats
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing/auth page
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Sidebar, AppShell
│   │   ├── providers/       # Theme, Session providers
│   │   └── command-palette.tsx
│   └── lib/
│       ├── auth.ts          # NextAuth config
│       ├── prisma.ts        # Prisma client singleton
│       └── utils.ts         # Utility functions
├── .env.example
├── package.json
└── README.md
```

## Database Schema

- **User** — id, name, email, password, timestamps
- **Task** — id, title, description, priority, status, tags, dueDate, order, userId
- **FocusSession** — id, duration, type, completed, startedAt, completedAt, userId
- **Note** — id, content, taskId (optional link), userId, timestamps

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:setup` | Push schema + seed |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

See `.env.example` for all required variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/focusboard"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## License

MIT