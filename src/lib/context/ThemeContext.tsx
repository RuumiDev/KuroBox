'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';

// ── Theme profiles ────────────────────────────────────────────────────────────

export type ThemeId = 'stealth' | 'radiation' | 'overdrive' | 'whiteout';

export interface ThemeProfile {
  id: ThemeId;
  code: string;
  name: string;
  description: string;
  accent: string; // hex for UI swatches
  bg: string;     // hex for reference
}

export const THEME_PROFILES: ThemeProfile[] = [
  {
    id: 'stealth',
    code: '01',
    name: 'Stealth',
    description: 'Pure Midnight',
    accent: '#FFDE4D',
    bg: '#000000',
  },
  {
    id: 'radiation',
    code: '02',
    name: 'Radiation',
    description: 'Toxic Lime Matrix',
    accent: '#39FF14',
    bg: '#111411',
  },
  {
    id: 'overdrive',
    code: '03',
    name: 'Overdrive',
    description: 'Industrial Smelting Core',
    accent: '#FF5F00',
    bg: '#121214',
  },
  {
    id: 'whiteout',
    code: '04',
    name: 'White-Out',
    description: 'High-Contrast Blueprint',
    accent: '#09090b',
    bg: '#ffffff',
  },
];

// ── Background pattern ────────────────────────────────────────────────────────

export type BackgroundPattern = 'none' | 'grid' | 'dots' | 'noise';

export const BACKGROUND_PATTERNS: { id: BackgroundPattern; label: string; description: string }[] = [
  { id: 'none',  label: 'None',          description: 'Flat digital black' },
  { id: 'grid',  label: 'Matrix Grid',   description: 'Technical graph grid overlay' },
  { id: 'dots',  label: 'Dot Matrix',    description: 'Retro terminal dot array' },
  { id: 'noise', label: 'Subtle Static', description: 'Film grain noise layer' },
];

const PATTERN_STORAGE_KEY = 'kurobox-bg-pattern';

function applyPatternToDOM(p: BackgroundPattern) {
  document.documentElement.setAttribute('data-pattern', p);
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeId;
  profile: ThemeProfile;
  setTheme: (id: ThemeId) => void;
  backgroundPattern: BackgroundPattern;
  setBackgroundPattern: (p: BackgroundPattern) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'stealth',
  profile: THEME_PROFILES[0],
  setTheme: () => {},
  backgroundPattern: 'none',
  setBackgroundPattern: async () => {},
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'kurobox-theme';
const VALID_THEMES = new Set<string>(THEME_PROFILES.map(p => p.id));

function resolveTheme(raw: string | null | undefined): ThemeId {
  return raw && VALID_THEMES.has(raw) ? (raw as ThemeId) : 'stealth';
}

function applyThemeToDOM(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage synchronously so state matches the DOM set by
  // the inline anti-flicker script before the first render.
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return 'stealth';
    return resolveTheme(window.localStorage.getItem(STORAGE_KEY));
  });

  const [backgroundPattern, setBgPatternState] = useState<BackgroundPattern>(() => {
    if (typeof window === 'undefined') return 'none';
    const stored = window.localStorage.getItem(PATTERN_STORAGE_KEY);
    return (stored === 'grid' || stored === 'dots' || stored === 'noise') ? stored : 'none';
  });

  // On mount: sync from Supabase user_metadata for cross-device consistency.
  useEffect(() => {
    const syncFromServer = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const serverTheme = resolveTheme(user?.user_metadata?.theme_preference);
        if (user && serverTheme !== theme) {
          setThemeState(serverTheme);
          applyThemeToDOM(serverTheme);
          localStorage.setItem(STORAGE_KEY, serverTheme);
        }
        // Sync background_pattern from profiles table
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('background_pattern')
            .eq('id', user.id)
            .single();
          if (profile?.background_pattern) {
            const p = profile.background_pattern as BackgroundPattern;
            setBgPatternState(p);
            applyPatternToDOM(p);
            localStorage.setItem(PATTERN_STORAGE_KEY, p);
          }
        }
      } catch {
        // Non-critical — localStorage is the source of truth.
      }
    };
    syncFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback(async (id: ThemeId) => {
    setThemeState(id);
    applyThemeToDOM(id);
    localStorage.setItem(STORAGE_KEY, id);

    // Fire-and-forget Supabase user_metadata sync.
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({ data: { theme_preference: id } });
      }
    } catch {
      // Non-critical.
    }
  }, []);

  const setBackgroundPattern = useCallback(async (p: BackgroundPattern) => {
    setBgPatternState(p);
    applyPatternToDOM(p);
    localStorage.setItem(PATTERN_STORAGE_KEY, p);

    // Persist to profiles table (canonical cross-device store).
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, background_pattern: p, updated_at: new Date().toISOString() });
      }
    } catch {
      // Non-critical.
    }
  }, []);

  const profile = THEME_PROFILES.find(p => p.id === theme) ?? THEME_PROFILES[0];

  return (
    <ThemeContext.Provider value={{ theme, profile, setTheme, backgroundPattern, setBackgroundPattern }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
