'use client';

import { useState, useRef, useEffect } from 'react';
import { Moon, Zap, Flame, Sun, ChevronDown, Check } from 'lucide-react';
import { useTheme, THEME_PROFILES, ThemeId } from '@/lib/context/ThemeContext';

const THEME_ICONS: Record<ThemeId, React.ReactNode> = {
  stealth:   <Moon  size={12} />,
  radiation: <Zap   size={12} />,
  overdrive: <Flame size={12} />,
  whiteout:  <Sun   size={12} />,
};

export default function ThemeSelector() {
  const { theme, profile, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Switch theme"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2 py-1 text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-800 rounded-sm transition-colors cursor-pointer"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 ring-1 ring-black/20"
          style={{ backgroundColor: profile.accent }}
        />
        <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest select-none">
          {profile.name}
        </span>
        <ChevronDown
          size={10}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Dropdown ────────────────────────────────────────────── */}
      {open && (
        <div
          role="menu"
          aria-label="Theme profiles"
          className="absolute right-0 top-full mt-1.5 w-56 bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl shadow-black/60 z-[100] overflow-hidden animate-theme-drop"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
              Theme Matrix
            </span>
            <span className="text-[9px] font-mono text-zinc-700">
              {profile.code} / {String(THEME_PROFILES.length).padStart(2, '0')}
            </span>
          </div>

          {/* Profile rows */}
          {THEME_PROFILES.map(p => {
            const isActive = theme === p.id;
            return (
              <button
                key={p.id}
                role="menuitem"
                onClick={() => { setTheme(p.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer transition-colors group ${
                  isActive ? 'bg-zinc-800/70' : 'hover:bg-zinc-800/50'
                }`}
              >
                {/* Accent swatch */}
                <span
                  className="w-3.5 h-3.5 rounded-sm shrink-0 border border-white/10"
                  style={{
                    backgroundColor: p.accent,
                    boxShadow: isActive ? `0 0 8px ${p.accent}55` : 'none',
                  }}
                />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-zinc-700">{p.code}</span>
                    <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {p.name}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-600 truncate mt-0.5">{p.description}</p>
                </div>

                {/* Icon + checkmark */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`transition-colors ${isActive ? 'text-zinc-400' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                    {THEME_ICONS[p.id]}
                  </span>
                  {isActive && (
                    <Check size={10} style={{ color: p.accent }} />
                  )}
                </div>
              </button>
            );
          })}

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-zinc-800">
            <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-800">
              Synced · KuroBox Design
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
