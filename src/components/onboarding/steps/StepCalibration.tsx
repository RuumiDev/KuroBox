'use client';

import { Ban, Grid3x3, Dot, Sparkles, Palette } from 'lucide-react';
import {
  ThemeId,
  BackgroundPattern,
  THEME_PROFILES,
  BACKGROUND_PATTERNS,
} from '@/lib/context/ThemeContext';

interface StepCalibrationProps {
  selectedTheme: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  selectedPattern: BackgroundPattern;
  onPatternChange: (p: BackgroundPattern) => void;
}

const PATTERN_ICONS: Record<BackgroundPattern, React.ReactNode> = {
  none:  <Ban      size={13} />,
  grid:  <Grid3x3  size={13} />,
  dots:  <Dot      size={13} />,
  noise: <Sparkles size={13} />,
};

export default function StepCalibration({
  selectedTheme,
  onThemeChange,
  selectedPattern,
  onPatternChange,
}: StepCalibrationProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Palette size={13} className="text-[var(--kb-accent)]" />
        <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
          theme_calibration.sys
        </span>
      </div>
      <h2 className="text-[var(--kb-text)] font-bold text-[15px] tracking-tight leading-none mb-1">
        VISUAL PROFILE
      </h2>
      <p className="font-mono text-[10px] text-zinc-600 mb-5">
        SELECT YOUR COLOR MATRIX — CHANGES APPLY LIVE
      </p>

      {/* ── Color profiles ── */}
      <div className="mb-5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-700 mb-2.5">
          CORE COLOR PROFILES
        </div>
        <div className="grid grid-cols-5 gap-2">
          {THEME_PROFILES.map(p => {
            const isActive = selectedTheme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onThemeChange(p.id)}
                title={`${p.name} — ${p.description}`}
                className={[
                  'relative p-2.5 border rounded-sm text-left transition-all duration-150 cursor-pointer group',
                  isActive
                    ? 'border-dashed'
                    : 'border-[var(--kb-border)] bg-[var(--kb-surface)] hover:border-zinc-600',
                ].join(' ')}
                style={
                  isActive
                    ? { borderColor: p.accent, backgroundColor: `${p.accent}12` }
                    : {}
                }
              >
                {/* Color swatch */}
                <div
                  className="w-full h-6 rounded-sm mb-2 transition-all"
                  style={{
                    backgroundColor: p.bg,
                    border: `2px solid ${p.accent}`,
                    boxShadow: isActive ? `0 0 10px ${p.accent}50` : 'none',
                  }}
                />
                <p className="text-[10px] font-bold text-[var(--kb-text)] leading-none truncate">
                  {p.name}
                </p>
                <p className="font-mono text-[8px] text-zinc-600 mt-0.5">{p.code}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ambient canvas ── */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-700 mb-2.5">
          AMBIENT CANVAS
        </div>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_PATTERNS.map(pat => {
            const isActive = selectedPattern === pat.id;
            return (
              <button
                key={pat.id}
                onClick={() => onPatternChange(pat.id)}
                className={[
                  'flex flex-col items-center gap-1.5 p-3 border rounded-sm transition-all cursor-pointer',
                  isActive
                    ? 'border-[var(--kb-accent)] bg-[var(--kb-accent)]/10 text-[var(--kb-accent)]'
                    : 'border-[var(--kb-border)] bg-[var(--kb-surface)] text-zinc-600 hover:border-zinc-600 hover:text-zinc-400',
                ].join(' ')}
              >
                {PATTERN_ICONS[pat.id]}
                <span className="font-mono text-[9px] uppercase tracking-wide leading-none">
                  {pat.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[9px] text-zinc-700 mt-2 text-center uppercase tracking-wider">
          TEXTURE PERSISTS ACROSS ALL VIEWS
        </p>
      </div>
    </div>
  );
}
