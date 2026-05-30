# KuroBox — Dynamic Kanban & Table Engine

> A cyber-industrial workspace for tracking anything — jobs, tasks, projects — with a fully dynamic schema, dual views, and real-time Supabase backend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Deployment (Vercel)](#deployment-vercel)
- [Roadmap](#roadmap)

---

## Overview

KuroBox is a full-stack productivity app that combines the flexibility of a kanban board with the structure of a spreadsheet. Every board has its own **dynamic schema** — you define the columns, their types, and the status pipeline, all without touching code.

Built for speed and extensibility: spin up a "Job Tracker", a "Sprint Board", or a blank canvas in seconds. Import data from CSV or Markdown, drag cards between stages, and switch seamlessly between Kanban and Table views.

---

## Features

| Feature | Description |
|---|---|
| **Dual views** | Toggle between Kanban (drag-and-drop columns) and Table (spreadsheet with inline editing) |
| **Dynamic schema** | Add, rename, reorder, hide, or delete fields per board — text, select, date, URL, markdown, attachment |
| **Board templates** | "Job Tracking", "Task Board", and "Blank Canvas" — pre-configured schemas with one click |
| **Card detail modal** | Glassmorphism overlay with status pills, all field editors, and delete |
| **Schema Manager** | Dedicated UI to manage field names, types, and visibility |
| **Universal Importer** | Drag-drop CSV or Markdown files to import cards in bulk |
| **Auth** | Email/password signup with Supabase Auth + email confirmation |
| **RLS** | Row-Level Security — each user only sees their own boards and cards |
| **Optimistic UI** | Local state updates instantly on mutation, background DB sync |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | TypeScript 5 |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Auth) |
| **Supabase client** | `@supabase/ssr` (server + browser split) |
| **Styling** | Tailwind CSS 3 |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Icons** | Lucide React |
| **CSV parsing** | PapaParse |
| **Markdown parsing** | gray-matter |
| **Font** | Plus Jakarta Sans |
| **Deployment** | Vercel |

---

## Architecture

```
KuroBox
├── Next.js App Router
│   ├── (auth)          → /login, /signup — public pages
│   ├── (app)           → /dashboard, /board/[boardId] — protected pages
│   └── auth/callback   → Supabase email confirmation exchange
│
├── Server Components (RSC)
│   ├── Fetch boards / cards via server Supabase client
│   └── Redirect unauthenticated users
│
├── Client Components
│   ├── useBoard()      → board state + CRUD with optimistic updates
│   ├── useCards()      → card state + CRUD with optimistic updates
│   └── All Supabase clients instantiated LAZILY inside event handlers
│
├── Middleware (middleware.ts)
│   └── Redirects /dashboard and /board/* to /login if no session
│
└── Supabase
    ├── profiles        → 1-1 with auth.users (auto-created via trigger)
    ├── boards          → name, config (JSONB schema), owner
    └── cards           → title, content (JSONB attributes), status, position
```

### Key Architectural Decision: Lazy Client Initialization

In Next.js App Router, **client components still render server-side** for the HTML shell. Any browser-only SDK (like the Supabase browser client) that calls `window` or `document` at module scope will crash during SSR.

**Solution**: `createClient()` is always called *inside* event handlers and async callbacks — never at the component body level or in hook closures.

```typescript
// ✅ Correct — called inside the handler
async function handleLogin() {
  const supabase = createClient()
  await supabase.auth.signInWithPassword({ email, password })
}

// ❌ Wrong — called at component render time (crashes SSR)
const supabase = createClient()
```

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- A [Supabase](https://supabase.com/) project

### 1. Clone and Install

```bash
git clone https://github.com/your-username/kurobox.git
cd kurobox
npm install
```

### 2. Set Up Environment Variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find both values in your Supabase dashboard under **Project Settings → API**.

### 3. Apply the Database Schema

In your Supabase dashboard, open the **SQL Editor** and run:

```bash
# Copy and paste the contents of supabase/schema.sql
```

This creates:
- `profiles` — auto-created for each new user via trigger
- `boards` — with JSONB `config` column for dynamic schema
- `cards` — with JSONB `content` column for dynamic attributes
- RLS policies ensuring users only access their own data

### 4. Configure Auth

In your Supabase dashboard:
1. **Authentication → Settings → Site URL**: set to `http://localhost:3000` (dev) or your Vercel domain (prod)
2. **Authentication → Settings → Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://your-domain.vercel.app/auth/callback`

### 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |

> **Never commit `.env.local`** — it's in `.gitignore`. Use `.env.local.example` as the template.

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | FK → `auth.users.id` |
| `email` | `text` | |
| `created_at` | `timestamptz` | |

### `boards`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `name` | `text` | Board display name |
| `config` | `jsonb` | Dynamic schema: fields, statuses, template |
| `created_at` | `timestamptz` | |

### `cards`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `board_id` | `uuid` | FK → `boards.id` |
| `title` | `text` | Card headline |
| `content` | `jsonb` | Dynamic attribute values keyed by field ID |
| `status` | `text` | Maps to a status in `boards.config.statuses` |
| `position` | `integer` | Sort order within a status column |
| `created_at` | `timestamptz` | |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          → Login form
│   │   └── signup/page.tsx         → Signup form
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx            → Server component — fetches boards
│   │   │   └── DashboardClient.tsx → Board grid, New Board modal
│   │   └── board/[boardId]/
│   │       ├── page.tsx            → Server component — fetches board + cards
│   │       └── BoardClient.tsx     → Kanban / Table + all modals
│   ├── auth/callback/route.ts      → Email confirmation exchange
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    → Redirects to /dashboard
│
├── components/
│   ├── ui/                         → Button, Modal, Badge
│   ├── kanban/                     → KanbanBoard, KanbanColumn, KanbanCard
│   ├── table/                      → TableView, TableCell
│   ├── schema/                     → SchemaManager
│   ├── importer/                   → UniversalImporter
│   ├── onboarding/                 → TemplateSelector
│   ├── CardModal.tsx               → Card detail overlay
│   └── ViewToggle.tsx              → Kanban / Table switcher
│
├── lib/
│   ├── hooks/
│   │   ├── useBoard.ts             → Board CRUD + optimistic state
│   │   └── useCards.ts             → Card CRUD + optimistic state
│   ├── supabase/
│   │   ├── client.ts               → Browser client factory (lazy)
│   │   └── server.ts               → Server client (RSC / middleware)
│   └── utils/
│       ├── templates.ts            → Board template definitions
│       └── importers.ts            → CSV + Markdown parsers
│
├── types/
│   └── index.ts                    → AttributeType, BoardConfig, Card, etc.
│
middleware.ts                       → Auth guard for protected routes
supabase/
└── schema.sql                      → Full DB schema with RLS
```

---

## Design System

KuroBox uses a **Cyber-Industrial** visual language:

| Token | Value |
|---|---|
| Background | `#000000` (pure black) |
| Surface | `#18181b` (`zinc-900`) |
| Border | `#27272a` (`zinc-800`) |
| Text | `#ffffff` |
| Accent | `#FFDE4D` (Cyber Yellow) |
| Secondary accent | `#FF5F00` (Hot Orange) |
| Font | Plus Jakarta Sans |
| Card hover | `scale-[1.01] rotate-1 shadow-[3px_3px_0px_#FFDE4D]` |
| Modal | `backdrop-blur-xl bg-black/60` (glassmorphism) |

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init        # if not already
git add .
git commit -m "Initial KuroBox commit"
git remote add origin https://github.com/your-username/kurobox.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### 3. Update Supabase Auth URLs

After your Vercel deployment URL is live (e.g. `https://kurobox.vercel.app`):

1. Supabase Dashboard → **Authentication → Settings**
2. Add to **Redirect URLs**: `https://kurobox.vercel.app/auth/callback`
3. Update **Site URL** to your Vercel domain (for production)

---

## Roadmap

- [ ] Drag-and-drop card reordering within columns
- [ ] Board sharing / collaboration (multi-user)
- [ ] File attachment uploads (Supabase Storage)
- [ ] Card activity log / comments
- [ ] Keyboard shortcuts
- [ ] Dark/light mode toggle
- [ ] Board-level search and filtering
- [ ] CSV export

---

## License

MIT — free to use, fork, and build upon.
