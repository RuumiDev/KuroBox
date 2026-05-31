'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TemplateId } from '@/types';
import { BOARD_TEMPLATES } from '@/lib/utils/templates';
import { useTheme, ThemeId, BackgroundPattern } from '@/lib/context/ThemeContext';
import StepIdentity from './steps/StepIdentity';
import StepCalibration from './steps/StepCalibration';
import StepDataDeck from './steps/StepDataDeck';

interface OnboardingStepperProps {
  userId: string;
  onComplete: () => void;
}

interface OnboardingData {
  shokunin_tag: string;
  templateId: TemplateId | null;
  backgroundPattern: BackgroundPattern;
  themeId: ThemeId;
}

interface FlashDot {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const TOTAL = 3;
const FLASH_COLORS = ['#22c55e', '#86efac', '#E8003D', '#4ade80'];

function buildFlashes(): FlashDot[] {
  return Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: 4 + Math.random() * 92,
    y: 4 + Math.random() * 92,
    size: 5 + Math.random() * 16,
    delay: Math.random() * 0.75,
    color: FLASH_COLORS[i % FLASH_COLORS.length],
  }));
}

export default function OnboardingStepper({ userId, onComplete }: OnboardingStepperProps) {
  const { theme, setTheme, setBackgroundPattern } = useTheme();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showFlashes, setShowFlashes] = useState(false);
  const [flashes] = useState<FlashDot[]>(buildFlashes);
  const [data, setData] = useState<OnboardingData>({
    shokunin_tag: '',
    templateId: null,
    backgroundPattern: 'none',
    themeId: theme,
  });
  const router = useRouter();

  const canProceed =
    (step === 1 && data.shokunin_tag.trim().length >= 2) ||
    step === 2 ||
    (step === 3 && data.templateId !== null);

  const next = () => setStep(s => Math.min(s + 1, TOTAL));
  const back = () => setStep(s => Math.max(s - 1, 1));

  // Live-preview theme calibration changes
  const handleThemeChange = useCallback((id: ThemeId) => {
    setData(d => ({ ...d, themeId: id }));
    setTheme(id);
  }, [setTheme]);

  const handlePatternChange = useCallback(async (p: BackgroundPattern) => {
    setData(d => ({ ...d, backgroundPattern: p }));
    await setBackgroundPattern(p);
  }, [setBackgroundPattern]);

  const handleFinalize = useCallback(async () => {
    if (!data.templateId || submitting) return;
    setSubmitting(true);
    setShowFlashes(true);

    const supabase = createClient();
    const template = BOARD_TEMPLATES.find(t => t.id === data.templateId)!;
    const trimmed = data.shokunin_tag.trim() || 'Craftsman';

    // Persist shokunin profile
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: trimmed,
        shokunin_tag: trimmed,
        background_pattern: data.backgroundPattern,
        updated_at: new Date().toISOString(),
      });

    // Create starter board — select id so we can route directly
    const statusAttr = template.schema.attributes.find(a => a.id === 'status');
    const columnOrder = statusAttr?.options ?? template.defaultColumns;

    const { data: newBoard } = await supabase
      .from('boards')
      .insert({
        user_id: userId,
        title: `${trimmed}'s ${template.name}`,
        config: {
          view: 'kanban',
          visible_attributes: template.schema.attributes
            .filter(a => a.isEnabled)
            .map(a => a.id),
          column_order: columnOrder,
        },
        schema_definition: template.schema,
        pipeline_columns: columnOrder,
      })
      .select('id')
      .single();

    setTimeout(() => {
      setShowFlashes(false);
      if (newBoard?.id) {
        router.push(`/board/${newBoard.id}`);
      } else {
        onComplete();
        router.refresh();
      }
    }, 1400);
  }, [submitting, data, userId, router, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      {/* ── Flash overlay ── */}
      {showFlashes && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          {flashes.map(f => (
            <div
              key={f.id}
              className="absolute rounded-sm flash-commit"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: f.size,
                height: f.size,
                backgroundColor: f.color,
                animationDelay: `${f.delay}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Main card ── */}
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden">

        {/* Progress header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
              SHOKUNIN SETUP · 職人
            </span>
            <span className="font-mono text-[9px] text-zinc-700">
              {String(step).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL }, (_, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: i < step ? 'var(--kb-accent)' : '#27272a' }}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <StepIdentity
              username={data.shokunin_tag}
              onChange={v => setData(d => ({ ...d, shokunin_tag: v }))}
            />
          )}
          {step === 2 && (
            <StepCalibration
              selectedTheme={data.themeId}
              onThemeChange={handleThemeChange}
              selectedPattern={data.backgroundPattern}
              onPatternChange={handlePatternChange}
            />
          )}
          {step === 3 && (
            <StepDataDeck
              selected={data.templateId}
              onSelect={id => setData(d => ({ ...d, templateId: id }))}
            />
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 pb-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1 || submitting}
            className="font-mono text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ← BACK
          </button>

          {step < TOTAL ? (
            <button
              onClick={next}
              disabled={!canProceed}
              className="font-mono text-[11px] bg-[var(--kb-accent)] text-[var(--kb-accent-fg)] px-4 py-1.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              NEXT STEP →
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={!canProceed || submitting}
              className="font-mono text-[11px] bg-[var(--kb-accent)] text-[var(--kb-accent-fg)] px-4 py-1.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'INITIALIZING…' : 'INITIALIZE WORKSPACE →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
