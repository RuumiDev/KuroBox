# KuroBox — Dynamic Kanban & Table Engine

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Theme](https://img.shields.io/badge/Themes-4%20Profiles%20%7C%20Cyber--Industrial-FFDE4D?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

> A cyber-industrial workspace for tracking anything — jobs, tasks, projects — with a fully dynamic schema, dual views, 4-profile theme engine, and real-time Supabase backend.

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
- [Design System & Theme Engine](#design-system--theme-engine)
- [Current Constraints](#current-constraints)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

KuroBox is a full-stack productivity app that combines the flexibility of a kanban board with the structure of a spreadsheet. Every board has its own **dynamic schema** — define the columns, field types, and status pipeline without touching code.

Built for speed and extensibility: spin up a "Job Tracker", a "Sprint Board", or a blank canvas in seconds. Import data from CSV or Markdown, drag cards between stages, and switch seamlessly between Kanban and Table views. The **4-profile ThemeController** lets you switch between Stealth, Radiation, Overdrive, and White-Out themes with instant CSS-variable-driven repaints and cross-device persistence via Supabase.

---

## Features

| Feature | Description |
|---|---|
| **Dual views** | Toggle between Kanban (drag-and-drop columns) and Table (spreadsheet with inline editing) |
| **Dynamic schema** | Add, rename, reorder, hide, or delete fields per board — text, select, date, URL, markdown, attachment |
| **Board templates** | "Job Tracking", "Task Board", and "Blank Canvas" — pre-configured schemas with one click |
| **Board CRUD** | Create, rename (inline), and delete boards from the dashboard |
| **Card detail modal** | Glassmorphism overlay with status pills, all field editors, and delete |
| **Schema Manager** | Dedicated UI to manage field names, types, visibility, and tag options (always-visible option editor for `select` fields) |
| **Universal Importer** | Drag-drop CSV or Markdown files to import cards in bulk |
| **4-Profile ThemeController** | Stealth · Radiation · Overdrive · White-Out — CSS custom property themes with localStorage + Supabase cross-device sync |
| **Anti-flicker themes** | Inline `<script>` in root layout reads localStorage before first paint — zero flash on reload |
| **Auth** | Email/password signup + **Google OAuth** via Supabase Auth |
| **Onboarding Stepper** | 4-step wizard (profile → templates → schema preview → launch) for first-time users |
| **RLS** | Row-Level Security — each user only sees their own boards and cards |
| **Optimistic UI** | Local state updates instantly on mutation, background DB sync |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, RSC + Client Components) |
| **Language** | TypeScript 5 |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Auth) |
| **Supabase client** | `@supabase/ssr` (server + browser split, lazy init) |
| **Styling** | Tailwind CSS 3 + CSS custom properties (theme engine) |
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
│   ├── (auth)          → /login, /signup — public pages with Google OAuth
│   ├── (app)           → /dashboard, /board/[boardId] — protected pages
│   └── auth/callback   → OAuth + email confirmation code exchange
│
├── Server Components (RSC)
│   ├── Fetch boards / cards via server Supabase client
│   └── Redirect unauthenticated users
│
├── Client Components
│   ├── useBoard()      → board state + CRUD with optimistic updates
│   ├── useCards()      → card state + CRUD with optimistic updates
│   ├── ThemeProvider   → CSS var switching, localStorage, Supabase sync
│   └── All Supabase clients instantiated LAZILY inside event handlers
│
├── Middleware (middleware.ts)
│   └── Redirects /dashboard and /board/* to /login if no session
│
└── Supabase
    ├── profiles        → 1-1 with auth.users (auto-created via trigger)
    ├── boards          → title, config (JSONB schema), owner
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

### Theme Engine Architecture

Themes are driven by CSS custom properties set on `html[data-theme="…"]`. Tailwind classes like `bg-zinc-900` and `bg-[#FFDE4D]` are remapped to CSS vars via high-specificity `html .class` overrides in `globals.css`. This lets the entire UI theme-switch without touching component code.

```
User picks theme
  → setTheme(id) in ThemeContext
  → document.documentElement.setAttribute('data-theme', id)    // instant CSS repaint
  → localStorage.setItem('kurobox-theme', id)                  // persist locally
  → supabase.auth.updateUser({ data: { theme_preference } })   // fire-and-forget cross-device sync
```

Anti-flicker: an inline `<script>` in the root layout reads `localStorage` and sets `data-theme` synchronously before any content paints, eliminating the "flash of wrong theme" on page reload.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone and Install

```bash
git clone https://github.com/RuumiDev/KuroBox.git
cd KuroBox
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find both values in **Supabase Dashboard → Project Settings → API**.

### 3. Apply the Database Schema

In your Supabase dashboard, open the **SQL Editor** and run the contents of `supabase/schema.sql`. This creates:

- `profiles` — auto-created for each new user via trigger
- `boards` — with JSONB `config` column for dynamic schema
- `cards` — with JSONB `content` column for dynamic attributes
- RLS policies ensuring users only access their own data

### 4. Configure Auth

In your Supabase dashboard:

1. **Authentication → Settings → Site URL**: `http://localhost:3000` (dev) or your Vercel domain (prod)
2. **Authentication → Settings → Redirect URLs**: add both:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

**For Google OAuth** (optional):
1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Supabase Dashboard → **Authentication → Providers → Google** → paste Client ID + Secret
3. Add the Supabase callback URL shown there to your Google OAuth app's **Authorized redirect URIs**

### 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First-time users go through the 4-step onboarding wizard.

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
| `username` | `text` | Set during onboarding |
| `email` | `text` | |
| `created_at` | `timestamptz` | |

### `boards`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `title` | `text` | Board display name |
| `config` | `jsonb` | View, column order, visible attributes |
| `schema_definition` | `jsonb` | Full field schema (types, options, order) |
| `created_at` | `timestamptz` | |

### `cards`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `board_id` | `uuid` | FK → `boards.id` |
| `title` | `text` | Card headline |
| `content` | `jsonb` | Dynamic attribute values keyed by field ID |
| `status` | `text` | Maps to a status in `boards.config.column_order` |
| `position` | `integer` | Sort order within a status column |
| `created_at` | `timestamptz` | |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              → Login form + Google OAuth
│   │   └── signup/page.tsx             → Signup form + Google OAuth
│   ├── (app)/
│   │   ├── layout.tsx                  → Auth guard (server)
│   │   ├── dashboard/
│   │   │   ├── page.tsx                → Server component — fetches boards
│   │   │   └── DashboardClient.tsx     → Board grid, inline rename/delete, new board modal
│   │   └── board/[boardId]/
│   │       ├── page.tsx                → Server component — fetches board + cards
│   │       └── BoardClient.tsx         → Kanban / Table + all modals
│   ├── auth/callback/route.ts          → OAuth + email code exchange (cookie-safe)
│   ├── globals.css                     → CSS vars for 4 themes + Tailwind class overrides
│   ├── layout.tsx                      → ThemeProvider + anti-flicker script
│   └── page.tsx                        → Redirects to /dashboard
│
├── components/
│   ├── ui/                             → Button (semantic kb-accent tokens), Modal, Badge
│   ├── navigation/
│   │   └── ThemeSelector.tsx           → Dropdown theme switcher (topbar)
│   ├── kanban/                         → KanbanBoard, KanbanColumn, KanbanCard
│   ├── table/                          → TableView, TableCell
│   ├── schema/                         → SchemaManager (always-visible tag option editor)
│   ├── importer/                       → UniversalImporter (CSV + Markdown)
│   ├── onboarding/
│   │   ├── OnboardingStepper.tsx       → 4-step first-run wizard
│   │   └── TemplateSelector.tsx        → Board template picker
│   ├── CardModal.tsx                   → Card detail overlay
│   └── ViewToggle.tsx                  → Kanban / Table switcher
│
├── lib/
│   ├── context/
│   │   └── ThemeContext.tsx            → ThemeProvider, useTheme, THEME_PROFILES
│   ├── hooks/
│   │   ├── useBoard.ts                 → Board CRUD + optimistic state
│   │   └── useCards.ts                 → Card CRUD + optimistic state
│   ├── supabase/
│   │   ├── client.ts                   → Browser client factory (lazy)
│   │   └── server.ts                   → Server client (RSC / middleware)
│   └── utils/
│       ├── templates.ts                → Board template definitions
│       └── importers.ts                → CSV + Markdown parsers
│
├── types/
│   └── index.ts                        → AttributeType, BoardConfig, Card, ThemeId, etc.
│
middleware.ts                           → Auth guard for protected routes
tailwind.config.ts                      → kb-* semantic color tokens + themeDropIn keyframe
supabase/
└── schema.sql                          → Full DB schema with RLS policies
design-system/
└── MASTER.md                           → Cyber-Industrial design spec
```

---

## Design System & Theme Engine

KuroBox uses a **Cyber-Industrial** visual language with a 4-profile theme engine. All colors are driven by CSS custom properties, making every component theme-aware without code changes.

### Theme Profiles

| # | Name | Accent | Background | Vibe |
|---|---|---|---|---|
| 01 | **Stealth** | `#FFDE4D` Cyber Yellow | `#000000` Pure Black | Default dark workspace |
| 02 | **Radiation** | `#39FF14` Toxic Lime | `#111411` Deep Forest | Neon-matrix energy |
| 03 | **Overdrive** | `#FF5F00` Hot Orange | `#121214` Charcoal | Industrial smelting core |
| 04 | **White-Out** | `#09090b` Near-Black | `#FFFFFF` Pure White | High-contrast blueprint |

### Semantic Color Tokens

All components are encouraged to use `kb-*` tokens for new code:

| Token | CSS var | Usage |
|---|---|---|
| `bg-kb-bg` | `--kb-bg` | Page background |
| `bg-kb-surface` | `--kb-surface` | Cards, panels |
| `bg-kb-surface-alt` | `--kb-surface-alt` | Hover states, nested surfaces |
| `border-kb-border` | `--kb-border` | Card/input borders |
| `bg-kb-accent` | `--kb-accent` | Primary buttons, active indicators |
| `bg-kb-accent-hover` | `--kb-accent-hover` | Button hover state |
| `text-kb-accent-fg` | `--kb-accent-fg` | Text on accent-colored backgrounds |
| `text-kb-text` | `--kb-text` | Primary text |
| `text-kb-text-muted` | `--kb-text-muted` | Secondary/helper text |

### Design Rules

- **Border radius**: `rounded-sm` (sharp, geometric — never `rounded-full`)
- **Shadows**: Crisp `shadow-[3px_3px_0px_var(--kb-accent)]` on drag — no soft blurs
- **Transitions**: 150–200ms ease for hover, 120ms cubic-bezier for dropdowns
- **Icons**: Lucide React SVGs only — no emoji
- **Cursor**: `cursor-pointer` on all interactive elements

---

## Current Constraints

These are known limitations in the current implementation. They are not bugs — they reflect deliberate scope decisions or deferred complexity.

### Data & Persistence
- **Single-user only** — RLS is scoped per `user_id`. No sharing, no multi-user access to a board.
- **No real-time sync** — Supabase Realtime is not subscribed to. Two open tabs will not sync without a manual refresh.
- **Card position is not drag-persisted across sessions** — Kanban column order within a status column resets to `position` from DB on reload. In-session drag reorder is local-only.
- **No file attachments** — The `attachment` field type exists in the schema system but renders no upload UI; no Supabase Storage bucket is wired up.
- **Theme is fire-and-forget synced** — `supabase.auth.updateUser()` for theme preference is not retried on failure. If the call fails (offline, rate-limited), localStorage is the fallback.

### Auth & Security
- **Google OAuth requires manual Supabase setup** — Not configurable via env vars alone; requires enabling the provider in the Supabase Dashboard.
- **No email change / password reset flow** — Only initial signup and login are implemented. "Forgot password" routes do not exist.
- **`user_metadata` for theme preference** — Uses Supabase Auth's `user_metadata` JSONB field (not a dedicated `profiles` column), which is Auth-tier data, not app-tier data.

### UI & Responsiveness
- **White-Out theme** has partial coverage — deep components (drag handles, kanban column headers, modal overlays) may retain residual dark styling not yet overridden by CSS vars.
- **No mobile drag-and-drop** — `@hello-pangea/dnd` uses mouse events. Kanban drag on touch screens is non-functional.
- **No board-level search or filter** — Cards can only be browsed visually; no full-text search or attribute-based filtering.
- **Schema Manager has no field reordering** — Fields can be toggled visible/hidden but their order in the schema array is insertion order only.

### Performance
- **`force-dynamic` on all app routes** — Disables static generation for `/dashboard` and `/board/*`, increasing cold-start latency on Vercel Edge.
- **No pagination** — All boards and all cards for a board are fetched in a single query. Large boards (1000+ cards) will be slow.
- **Tailwind CSS class override approach** — The `html .bg-black { background-color: var(--kb-bg) }` override strategy in `globals.css` applies to every element with that class globally, which may produce unexpected overrides in edge-case third-party components.

---

## Roadmap

Items are grouped by priority tier. ✅ = shipped, 🔲 = planned.

### Tier 1 — High Impact, Low Complexity
- 🔲 **Board-level search** — full-text search across card titles and content using PostgreSQL `tsvector`
- 🔲 **Card filtering + sorting** — filter by status, date range, field value; sort by any column in Table view
- 🔲 **CSV / JSON export** — download a board's cards as a flat file
- 🔲 **Password reset flow** — "Forgot password" email with Supabase `resetPasswordForEmail`
- 🔲 **Schema field reordering** — drag-and-drop in SchemaManager to change field display order
- 🔲 **Kanban position persistence** — write `position` to DB on drag-end so column order survives reload

### Tier 2 — Core Product Expansion
- 🔲 **File attachment uploads** — Supabase Storage bucket wired to the `attachment` field type with presigned URL previews
- 🔲 **Card comments / activity log** — threaded comments per card stored in a `card_events` table with user attribution
- 🔲 **Board duplication** — clone a board with its schema and optionally its cards
- 🔲 **Keyboard shortcuts** — `N` new card, `E` edit card, `/` search, `1`/`2` switch view, `T` cycle theme
- 🔲 **Pagination / virtual scroll** — cursor-based pagination for boards with 500+ cards
- 🔲 **Mobile drag-and-drop** — replace `@hello-pangea/dnd` with a touch-compatible DnD library (e.g. `dnd-kit`)

### Tier 3 — Collaboration & Scale
- 🔲 **Real-time sync** — Supabase Realtime channel subscription on `boards` + `cards` tables; broadcast cursor positions
- 🔲 **Board sharing (read-only links)** — public board URL with a signed token, no login required
- 🔲 **Team workspaces** — organisation entity with member roles (owner, editor, viewer); shared board access via workspace RLS policies
- 🔲 **Invitations** — email invite flow with accept/reject and role assignment

### Tier 4 — Power Features
- 🔲 **Calendar / Timeline view** — Gantt-style view driven by `date` field attributes
- 🔲 **Card dependencies** — link cards as blockers/blocked-by; visualise in a dependency graph
- 🔲 **AI card generation** — natural language → structured card via an Edge Function calling an LLM
- 🔲 **Automation rules** — "when status changes to X → send webhook / assign field value"
- 🔲 **Webhook / Zapier integration** — outbound events on card create/update/delete
- 🔲 **White-Out theme full coverage** — audit all components and close remaining override gaps
- 🔲 **Custom theme builder** — user-defined accent / background / surface colors beyond the 4 presets
- 🔲 **Native mobile app** — React Native / Expo sharing business logic via a shared API layer

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
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

## License

MIT — free to use, fork, and build upon.
