'use client';

import Link from 'next/link';
import { ArrowLeft, Ban, Grid3x3, Dot, Sparkles, Check } from 'lucide-react';
import {
  useTheme,
  THEME_PROFILES,
  BACKGROUND_PATTERNS,
  ThemeId,
  BackgroundPattern,
} from '@/lib/context/ThemeContext';
import ThemeSelector from '@/components/navigation/ThemeSelector';

const PATTERN_ICONS: Record<BackgroundPattern, React.ReactNode> = {
  none:  <Ban      size={16} />,
  grid:  <Grid3x3  size={16} />,
  dots:  <Dot      size={16} />,
  noise: <Sparkles size={16} />,
};

export default function InterfaceSettingsClient() {
  const { theme, setTheme, backgroundPattern, setBackgroundPattern } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--kb-bg)]">

      {/* ── Topbar ── */}
      <header className="border-b border-[var(--kb-border-subtle)] px-6 py-4 flex items-center justify-between sticky top-0 bg-[var(--kb-bg)] z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-[var(--kb-accent)] transition-colors"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline font-mono uppercase tracking-widest text-[10px]">Dashboard</span>
          </Link>
          <span className="text-zinc-800 hidden sm:inline">·</span>
          <span className="text-sm font-bold tracking-tight text-[var(--kb-text)]">Interface</span>
          <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest hidden sm:inline">
            Settings
          </span>
        </div>
        <ThemeSelector />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">

        {/* ── Section 01: Core Color Profiles ── */}
        <section>
          <div className="mb-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--kb-accent)] mb-1">
              SECTION 01
            </div>
            <h2 className="text-[var(--kb-text)] font-bold text-xl tracking-tight leading-none mb-1">
              Core Color Profiles
            </h2>
            <p className="text-[var(--kb-text-muted)] text-[13px]">
              Select the active visual theme. Changes apply instantly to all views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {THEME_PROFILES.map(p => {
              const isActive = theme === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setTheme(p.id as ThemeId)}
                  className={[
                    'relative p-4 border rounded-sm text-left transition-all duration-200 cursor-pointer group',
                    isActive
                      ? 'border-dashed'
                      : 'border-[var(--kb-border)] bg-[var(--kb-surface)] hover:border-zinc-600 hover:bg-[var(--kb-surface-alt)]',
                  ].join(' ')}
                  style={
                    isActive
                      ? {
                          borderColor: p.accent,
                          backgroundColor: `${p.accent}10`,
                          boxShadow: `0 0 0 1px ${p.accent}30`,
                        }
                      : {}
                  }
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-4 h-4 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: p.accent }}
                    >
                      <Check size={10} className="text-black" strokeWidth={3} />
                    </div>
                  )}

                  {/* Accent swatch */}
                  <div
                    className="w-full h-8 rounded-sm mb-3 transition-all"
                    style={{
                      backgroundColor: p.bg,
                      border: `2px solid ${p.accent}`,
                      boxShadow: isActive ? `0 0 12px ${p.accent}44` : 'none',
                    }}
                  />

                  <p className="font-mono text-[9px] text-zinc-600 mb-0.5">{p.code}</p>
                  <p className="text-[12px] font-bold text-[var(--kb-text)] leading-tight">{p.name}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 leading-snug">{p.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[var(--kb-border-subtle)]" />

        {/* ── Section 02: Ambient Wallpapers ── */}
        <section>
          <div className="mb-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--kb-accent)] mb-1">
              SECTION 02
            </div>
            <h2 className="text-[var(--kb-text)] font-bold text-xl tracking-tight leading-none mb-1">
              Ambient Canvas
            </h2>
            <p className="text-[var(--kb-text-muted)] text-[13px]">
              Background texture overlay projected across all views — login, dashboard, board, table.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BACKGROUND_PATTERNS.map(pat => {
              const isActive = backgroundPattern === pat.id;
              return (
                <button
                  key={pat.id}
                  onClick={() => setBackgroundPattern(pat.id as BackgroundPattern)}
                  className={[
                    'flex flex-col items-center gap-3 p-5 border rounded-sm transition-all cursor-pointer',
                    isActive
                      ? 'border-[var(--kb-accent)] bg-[var(--kb-accent)]/10 text-[var(--kb-accent)]'
                      : 'border-[var(--kb-border)] bg-[var(--kb-surface)] text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 hover:bg-[var(--kb-surface-alt)]',
                  ].join(' ')}
                  style={isActive ? { boxShadow: `0 0 0 1px var(--kb-accent)30` } : {}}
                >
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--kb-accent)' }}
                    />
                  )}
                  {PATTERN_ICONS[pat.id as BackgroundPattern]}
                  <div className="text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wide leading-none mb-1">
                      {pat.label}
                    </p>
                    <p className="text-[10px] text-zinc-600 leading-snug">{pat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Preview note ── */}
        <div className="border border-[var(--kb-border-subtle)] rounded-sm p-4 bg-[var(--kb-surface)]">
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
            GLOBAL INJECTION ACTIVE
          </p>
          <p className="text-[12px] text-zinc-500">
            Your selected color profile and canvas texture apply globally — including the login page, 
            dashboard, kanban board, and table view. Settings persist across devices via your Supabase profile.
          </p>
        </div>

      </main>
    </div>
  );
}
