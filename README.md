# KuroBox — Universal Kanban & Spreadsheet Engine

<p align="center">
  <img src="./Kuroboxfavicon/Icons/KuroBanner.gif" alt="KuroBox Banner" width="100%" />
</p>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Theme](https://img.shields.io/badge/Themes-7%20Profiles%20%7C%20Japanese%20Tech%20Minimalist-C05674?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![Version](https://img.shields.io/badge/Version-4.0-1A1A1A?style=flat-square)

> A Japanese Tech Minimalist workspace for tracking anything — jobs, tasks, projects — with a fully dynamic schema, dual views, 7-profile theme engine, 職人 onboarding wizard, and a real-time Supabase backend.

---

## Table of Contents

- [Overview](#overview)
- [What's New](#whats-new)
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

Built for speed and extensibility: spin up a "Job Tracker", a "Sprint Board", or a blank canvas in seconds. Import data from CSV or Markdown, drag cards between stages, and switch seamlessly between Kanban and Table views. The **7-profile theme engine** spans three dark industrial themes, three soft Japanese pastel light themes, and a manga-inspired comic panel mode — all with instant CSS-variable-driven repaints and cross-device persistence via Supabase.

---

## What's New

### v4.0 — Production SEO & OpenGraph Engine

| Area | Change |
|---|---|
| **Production metadata** | Full OpenGraph + Twitter card metadata with `KuroBanner.png` as the social preview image |
| **Theme-aware favicons** | `prefers-color-scheme: light` → dark-ink icon; `prefers-color-scheme: dark` → white icon — auto-swaps in browser tabs |
| **Apple touch icon** | `apple-touch-icon.png` at 180×180 from `Kuroboxfavicon/Icons/` |
| **`metadataBase`** | Reads `NEXT_PUBLIC_SITE_URL` env var; falls back to `https://kurobox.vercel.app` |
| **Static asset pipeline** | All favicon assets staged into `public/Kuroboxfavicon/` for Next.js static serving |

### v3.95 — Hover Contrast & Onboarding Language Refresh

| Area | Change |
|---|---|
| **Light-theme card hover** | Per-theme CSS overrides: Sakura→`#F3EBEB`, Matcha→`#ECF0EC`, Shinto→`#E9ECF3`, Panel-X→`#FFFFFF` — no more dark-overlay contrast fail |
| **Panel-X tactile pop** | `.kb-card:hover` → `translate(-2px,-2px) shadow-[6px_6px_0px_#000000]` manga panel lift |
| **Stepper progress tracker** | `[ 満 ｜ 満 ｜ 空 ] STEP 02/03` with kanji fill indicators replacing plain progress bars |
| **Step 1 — 職人署名** | Boot lines in Japanese; placeholder → `職人名を入力...`; label → `職人署名 · SHOKUNIN SIGN-OFF REGISTRY` |
| **Step 2 — 空間意匠** | Header → `空間意匠`; subtext → `カラープロファイルとキャンバスを選択 — LIVE PREVIEW` |
| **Step 3 — 起動プロトコル** | Header → `起動プロトコル`; finalize button → `黒箱を起動する →` |

### v3.9 — Column Layout & Asset Updates

| Area | Change |
|---|---|
| **Column width** | `w-[300px] shrink-0` — uniform fixed width, no content-stretch blowout |
| **Column vertical scroll** | `max-h-[calc(100vh-240px)] overflow-y-auto` — long columns scroll internally, header stays pinned |
| **Empty drop zones** | Zero-card columns: compact `min-h-[80px] h-auto` with dashed border — expands as cards land |
| **README banner** | `KuroBanner.gif` animated banner + title updated to "Universal Kanban & Spreadsheet Engine" |

### v3.8 — Kanban Clipping & Icon Quality

| Area | Change |
|---|---|
| **Kanban horizontal scroll** | Removed `max-w-7xl justify-center` — now `w-full justify-start overflow-x-auto` — columns never clip at viewport edges |
| **Panel-X ViewToggle contrast** | Inactive → `bg-zinc-100 text-zinc-700`; Active → `bg-zinc-950 text-white font-bold shadow-[2px_2px_0px_#000000]` |
| **Hi-res brand logo** | `KuroBoxLogo` component upgraded to `KuroBlack.png` / `KuroWhite.png` — crisp, unblurred at any size |
| **Auth logo size** | Login/Signup emblems: `w-16 h-16 md:w-20 md:h-20`; App headers: `size={32}` |

### v3.5 — Soft Light Palettes & Favicon Pipeline

| Area | Change |
|---|---|
| **3 new light themes** | Sakura (#FAF5F5 / #C05674), Matcha (#F5F7F5 / #3A6645), Shinto (#F4F6F9 / #3D5080) — replaced White-Out |
| **Panel-X redesign** | Light comic-book gray `#EFEFEF` + `#1A1A1A` ink accent + Dela Gothic One manga typography |
| **KuroBoxLogo component** | Replaces all placeholder accent squares — theme-aware, auto-switches dark/light icon variant |
| **Favicon pipeline** | Theme-aware `<link>` tags: dark OS → White icon; light OS → Black icon |
| **Wallpaper transparency** | Outer containers use `bg-transparent` — wallpaper canvas shows through properly |
| **Japanese subtexts** | `コントロールセンター`, `職人署名` labels in dashboard header; `看板`/`台帳` kanji in ViewToggle |
| **Login page redesign** | Tactical card layout, `KuroBoxLogo`, `SECURE WORKSPACE INTERFACE ACCESS // ログイン`, theme-aware inputs |

### v3.0 — Shokunin Onboarding & Interface Settings

| Area | Change |
|---|---|
| **3-step Shokunin wizard** | Identity (shokunin tag) → Calibration (live theme + wallpaper picker) → Data Deck (board template) |
| **`/settings/interface`** | Dedicated theme + wallpaper settings page accessible post-onboarding |
| **Dashboard centering** | Boards grid centered with `max-w-5xl mx-auto` — no full-width stretch |
| **DB schema v3.0** | `profiles.active_wallpaper`, `profiles.shokunin_tag`, `initialize_starter_board()` function |

### v2.5 — UI/UX & Functional Overhaul

| Area | Change |
|---|---|
| **Kanban card borders** | Status-based semantic outlines — Interview → violet, Offer → emerald, Rejected → crimson |
| **Table slab layout** | Floating structural slabs (`border-separate border-spacing-y-1.5` + `rounded-md`) — collapsible by status group |
| **Double-click cell edit** | Table cells render display mode by default; double-click activates inline editor |
| **Badge filter toolbar** | Text search + tag popover + active badge tokens with ✕ clear — works across both views |
| **Dashboard Command Center** | 4 metric widgets, board list with pipeline progress bars, live Activity Log feed |
| **Canvas wallpaper presets** | Matrix Grid, Dot Matrix, Subtle Static — chosen in onboarding, persisted to Supabase |

---

## Features

| Feature | Description |
|---|---|
| **Dual views** | Toggle between Kanban (drag-and-drop) and Table (slab layout with inline editing) |
| **Dynamic schema** | Add, rename, drag-reorder, hide, or delete fields per board — text, select, date, URL, markdown |
| **Pipeline column CRUD** | Add, rename, delete status columns with migrate-or-destroy reallocation modal |
| **Board templates** | "Job Tracking", "Task Board", "Blank Canvas" — pre-configured schemas with one click |
| **Board CRUD** | Create, rename (inline), and delete boards from the Command Center dashboard |
| **Card detail modal** | Full overlay with status pills, all field editors, and delete |
| **Schema Manager** | Two-tab UI: Data Fields (draggable, position-0 = Kanban card title) and Pipeline Columns |
| **Universal Importer** | Drag-drop CSV or Markdown files to import cards in bulk |
| **Badge filter toolbar** | Text search + multi-select tag filter popover + active badge tokens — works across both views |
| **Status-based card outlines** | Semantic low-opacity border tints based on pipeline status |
| **Canvas wallpaper presets** | Grid, Dots, Noise — persisted to Supabase `profiles` |
| **Command Center dashboard** | Metrics widgets + per-board pipeline progress bars + Activity Log feed |
| **7-profile ThemeEngine** | Stealth · Radiation · Overdrive · Sakura · Matcha · Shinto · Panel-X — CSS var themes with localStorage + Supabase sync |
| **Anti-flicker themes** | Inline `<script>` reads localStorage before first paint — zero flash on reload |
| **Auth** | Email/password signup + Google OAuth via Supabase Auth |
| **Shokunin onboarding wizard** | 3-step `職人セットアップ`: sign-off tag → workspace design → starter ledger deploy |
| **Interface settings page** | `/settings/interface` — change theme and wallpaper post-onboarding |
| **`KuroBoxLogo` component** | Theme-aware brand logo — auto-switches `KuroBlack.png` / `KuroWhite.png` based on active theme |
| **OpenGraph & Twitter cards** | `KuroBanner.png` social preview; theme-aware browser tab favicons |
| **RLS** | Row-Level Security — each user only sees their own boards and cards |
| **Optimistic UI** | Local state updates instantly on mutation; background DB sync |

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
| **Fonts** | Plus Jakarta Sans (body) · Dela Gothic One (Panel-X headings) |
| **Deployment** | Vercel |

---

## Architecture

```
KuroBox
├── Next.js App Router
│   ├── (auth)          → /login, /signup — public pages with Google OAuth
│   ├── (app)           → /dashboard, /board/[boardId], /settings/interface — protected
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
    ├── boards          → title, config (JSONB schema), pipeline_columns, owner
    └── cards           → attributes_data (JSONB), status, sort_order
```

### Key Architectural Decision: Lazy Client Initialization

In Next.js App Router, **client components still render server-side** for the HTML shell. Any browser-only SDK that calls `window` or `document` at module scope will crash during SSR.

**Solution**: `createClient()` is always called *inside* event handlers and async callbacks — never at the component body level.

```typescript
// ✅ Correct — called inside the handler
async function handleLogin() {
  const supabase = createClient()
  await supabase.auth.signInWithPassword({ email, password })
}

// ❌ Wrong — crashes SSR
const supabase = createClient()
```

### Theme Engine Architecture

Themes are driven by CSS custom properties set on `html[data-theme="…"]`. Tailwind classes like `bg-zinc-900` are remapped to CSS vars via high-specificity `html .class` overrides in `globals.css`. The entire UI theme-switches without touching component code.

```
User picks theme
  → setTheme(id) in ThemeContext
  → document.documentElement.setAttribute('data-theme', id)    // instant CSS repaint
  → localStorage.setItem('kurobox-theme', id)                  // persist locally
  → supabase.from('profiles').update({ active_wallpaper })     // cross-device sync
```

Anti-flicker: an inline `<script>` in the root layout reads `localStorage` and sets `data-theme` synchronously before any content paints.

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
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

Find the Supabase values in **Supabase Dashboard → Project Settings → API**.

### 3. Apply the Database Schema

In your Supabase dashboard, open the **SQL Editor** and run the full contents of `supabase/schema.sql`. This creates:

- `profiles` — auto-created for each new user via trigger
- `boards` — with JSONB `config` and `schema_definition` columns
- `cards` — with JSONB `attributes_data` column for dynamic fields
- RLS policies ensuring users only access their own data
- v2.0 → v3.5 migration blocks (safe to run on a fresh schema)

### 4. Configure Auth

In your Supabase dashboard:

1. **Authentication → Settings → Site URL**: `http://localhost:3000` (dev) or your Vercel domain (prod)
2. **Authentication → Settings → Redirect URLs**: add both:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

**For Google OAuth** (optional):
1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Supabase Dashboard → **Authentication → Providers → Google** → paste Client ID + Secret
3. Add the Supabase callback URL shown there to your Google app's **Authorized redirect URIs**

### 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First-time users go through the 3-step Shokunin onboarding wizard.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Full production URL — used for OpenGraph `metadataBase` |

> **Never commit `.env.local`** — it's in `.gitignore`.

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | FK → `auth.users.id` |
| `username` | `text` | Set during onboarding (shokunin tag) |
| `shokunin_tag` | `text` | Craftsman sign-off displayed in dashboard header (v3.0) |
| `background_pattern` | `text` | Canvas preset: `none` \| `grid` \| `dots` \| `noise` (v2.5) |
| `active_wallpaper` | `text` | Extended wallpaper key (v3.0) |
| `canvas_contrast_mode` | `text` | `soft-ink` for light themes (v3.5) |
| `updated_at` | `timestamptz` | |

### `boards`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `profiles.id` |
| `title` | `text` | Board display name |
| `config` | `jsonb` | View, `column_order[]`, visible attributes |
| `schema_definition` | `jsonb` | Full field schema (types, options, drag order) |
| `pipeline_columns` | `jsonb` | Dedicated column sequence store (v2.0) |
| `created_at` | `timestamptz` | |

### `cards`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `board_id` | `uuid` | FK → `boards.id` |
| `status` | `text` | Maps to a value in `config.column_order` (NOT NULL) |
| `sort_order` | `integer` | Position within a status column |
| `schema_layout_order` | `integer` | Field render ordering (v2.0) |
| `attributes_data` | `jsonb` | Dynamic field values keyed by `AttributeField.id` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Drives the Activity Log feed |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              → Tactical card login + Google OAuth + KuroBoxLogo
│   │   └── signup/page.tsx             → Signup form + Google OAuth + KuroBoxLogo
│   ├── (app)/
│   │   ├── layout.tsx                  → Auth guard (server)
│   │   ├── dashboard/
│   │   │   ├── page.tsx                → Server component — fetches boards
│   │   │   └── DashboardClient.tsx     → Command Center: metrics, board grid, Activity Log
│   │   ├── board/[boardId]/
│   │   │   ├── page.tsx                → Server component — fetches board + cards
│   │   │   └── BoardClient.tsx         → Kanban / Table + filter toolbar + all modals
│   │   └── settings/interface/
│   │       └── InterfaceSettingsClient.tsx → Theme + wallpaper settings page
│   ├── auth/callback/route.ts          → OAuth + email code exchange
│   ├── globals.css                     → CSS vars for 7 themes + Tailwind overrides + hover fixes
│   ├── layout.tsx                      → ThemeProvider + anti-flicker script + full OG metadata
│   └── page.tsx                        → Redirects to /dashboard
│
├── components/
│   ├── ui/                             → Button, Modal, Badge
│   ├── navigation/
│   │   ├── ThemeSelector.tsx           → Dropdown theme switcher (topbar) — 7 themes
│   │   └── KuroBoxLogo.tsx             → Theme-aware brand logo (KuroBlack/KuroWhite PNG)
│   ├── kanban/
│   │   ├── KanbanBoard.tsx             → Full-width horizontal scroll, no max-w clip
│   │   ├── KanbanColumn.tsx            → w-[300px] fixed + max-h scroll + adaptive empty zone
│   │   └── KanbanCard.tsx              → Status borders + kb-card hover class
│   ├── table/                          → TableView (slab layout), TableCell (double-click edit)
│   ├── schema/
│   │   ├── SchemaManager.tsx           → Two-tab: Data Fields (draggable) + Pipeline Columns
│   │   └── ColumnReallocationModal.tsx → Migrate-or-destroy modal for column deletion
│   ├── importer/                       → UniversalImporter (CSV + Markdown)
│   ├── onboarding/
│   │   ├── OnboardingStepper.tsx       → 3-step 職人セットアップ wizard with kanji progress tracker
│   │   └── steps/
│   │       ├── StepIdentity.tsx        → 職人署名 — shokunin tag input
│   │       ├── StepCalibration.tsx     → 空間意匠 — live theme + wallpaper picker
│   │       └── StepDataDeck.tsx        → 起動プロトコル — board template selector
│   ├── CardModal.tsx                   → Card detail overlay
│   └── ViewToggle.tsx                  → 看板 / 台帳 view switcher with kanji subtexts
│
├── lib/
│   ├── context/
│   │   └── ThemeContext.tsx            → ThemeProvider, 7 THEME_PROFILES, backgroundPattern
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
public/
├── Kuroboxfavicon/
│   ├── Black/                          → Dark-background icon set (used on dark OS)
│   ├── White/                          → Light-background icon set (used on light OS)
│   └── Icons/                          → KuroBanner.png, KuroBlack.png, KuroWhite.png
supabase/
└── schema.sql                          → Full DB schema with v2.0 → v3.5 migrations
```

---

## Design System & Theme Engine

KuroBox uses a **Modern Japanese Tech Minimalist** visual language with a 7-profile theme engine. All colors are driven by CSS custom properties, making every component theme-aware without code changes.

### Theme Profiles

| # | Name | Accent | Background | Vibe |
|---|---|---|---|---|
| 01 | **Stealth** | `#FFDE4D` Cyber Yellow | `#000000` Pure Black | Default dark workspace |
| 02 | **Radiation** | `#39FF14` Toxic Lime | `#111411` Deep Forest | Neon-matrix energy |
| 03 | **Overdrive** | `#FF5F00` Hot Orange | `#121214` Charcoal | Industrial smelting core |
| 04 | **Sakura** | `#C05674` Blush Rose | `#FAF5F5` Petal Cream | Soft blossom pastel |
| 05 | **Matcha** | `#3A6645` Bamboo Sage | `#F5F7F5` Pale Tea White | Calm Zen garden |
| 06 | **Shinto** | `#3D5080` Indigo Slate | `#F4F6F9` Porcelain Ice | Cool misty shrine |
| 07 | **Panel-X** | `#1A1A1A` Manga Ink | `#EFEFEF` Comic Gray | Tactical comic panel |

### Semantic Color Tokens

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
| `text-kb-text-dim` | `--kb-text-dim` | Tertiary/placeholder text |

### Design Rules

- **Border radius**: `rounded-sm` (sharp, geometric — never `rounded-full`) except auth cards (`rounded-lg`)
- **Shadows**: Crisp `shadow-[3px_3px_0px_var(--kb-accent)]` on drag; `shadow-[6px_6px_0px_#000000]` on Panel-X hover
- **Transitions**: 150–200ms ease for hover, 120ms cubic-bezier for dropdowns
- **Icons**: Lucide React SVGs only — no emoji
- **Typography**: Plus Jakarta Sans (all themes) + Dela Gothic One (Panel-X headings + mono)
- **Japanese subtexts**: Kanji labels beneath English text in headers and toggles for aesthetic identity

---

## Current Constraints

### Data & Persistence
- **Single-user only** — RLS is scoped per `user_id`. No sharing or multi-user board access.
- **No real-time sync** — Supabase Realtime is not subscribed to. Two open tabs will not sync without a manual refresh.
- **Card sort order is session-local** — Kanban drag-reorder does not persist `sort_order` to the DB on drag-end.
- **No file attachments** — The `attachment` field type exists but renders no upload UI; no Supabase Storage bucket is wired.

### Auth & Security
- **Google OAuth requires manual Supabase setup** — Not configurable via env vars alone; requires enabling the provider in the Supabase Dashboard.
- **No password reset flow** — "Forgot password" routes do not exist.

### UI & Responsiveness
- **No mobile drag-and-drop** — `@hello-pangea/dnd` uses mouse events. Kanban drag on touch screens is non-functional.
- **Filter is client-side only** — Scans in-memory cards; large boards (1000+ cards) may see latency.

### Performance
- **No pagination** — All boards and all cards for a board are fetched in a single query.
- **Tailwind CSS override approach** — Global `html .bg-black { … }` overrides may produce unexpected results in edge-case third-party components.

---

## Roadmap

### Tier 1 — High Impact, Low Complexity
- ✅ **Badge filter toolbar** (v2.5)
- ✅ **Schema field drag reordering** (v2.0)
- ✅ **Pipeline column CRUD** (v2.0)
- ✅ **Canvas wallpaper presets** (v2.5)
- ✅ **7-theme engine** (v3.5)
- ✅ **Shokunin onboarding wizard** (v3.0)
- ✅ **Production OpenGraph / favicon pipeline** (v4.0)
- 🔲 **Kanban sort-order persistence** — write `sort_order` to DB on drag-end
- 🔲 **Password reset flow** — `resetPasswordForEmail` email link
- 🔲 **Column sort in Table view** — sort rows by clicking any column header
- 🔲 **CSV / JSON export** — download a board's cards as a flat file

### Tier 2 — Core Product Expansion
- ✅ **Activity log feed** (v2.5)
- ✅ **Operational metrics dashboard** (v2.5)
- ✅ **Interface settings page** (v3.0)
- 🔲 **File attachment uploads** — Supabase Storage bucket wired to `attachment` field type
- 🔲 **Card comments** — threaded comments per card
- 🔲 **Board duplication** — clone a board with schema and optionally cards
- 🔲 **Keyboard shortcuts** — `N` new card, `E` edit, `/` search, `1`/`2` switch view, `T` cycle theme
- 🔲 **Pagination / virtual scroll** — cursor-based pagination for 500+ card boards
- 🔲 **Mobile drag-and-drop** — replace `@hello-pangea/dnd` with `dnd-kit`

### Tier 3 — Collaboration & Scale
- 🔲 **Real-time sync** — Supabase Realtime on `boards` + `cards`
- 🔲 **Board sharing (read-only links)** — public board URL with signed token
- 🔲 **Team workspaces** — organisation entity with member roles and shared RLS
- 🔲 **Invitations** — email invite flow with accept/reject

### Tier 4 — Power Features
- 🔲 **Calendar / Timeline view** — Gantt-style view from `date` field attributes
- 🔲 **AI card generation** — natural language → structured card via Edge Function + LLM
- 🔲 **Automation rules** — "when status changes to X → trigger webhook / assign field"
- 🔲 **Custom theme builder** — user-defined accent / background / surface beyond the 7 presets
- 🔲 **Native mobile app** — React Native / Expo sharing business logic

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "KuroBox v4.0"
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
   - `NEXT_PUBLIC_SITE_URL` — your Vercel domain (e.g. `https://kurobox.vercel.app`)
5. Click **Deploy**

### 3. Update Supabase Auth URLs

After your Vercel deployment URL is live:

1. Supabase Dashboard → **Authentication → Settings**
2. Add to **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`
3. Update **Site URL** to your Vercel domain

---

## License

MIT — free to use, fork, and build upon.
