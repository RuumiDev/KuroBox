'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TemplateId } from '@/types';
import { BOARD_TEMPLATES } from '@/lib/utils/templates';
import StepIdentity from './steps/StepIdentity';
import StepDataDeck from './steps/StepDataDeck';
import StepProtocol from './steps/StepProtocol';
import StepFinalize from './steps/StepFinalize';
import { BackgroundPattern } from '@/lib/context/ThemeContext';

interface OnboardingStepperProps {
  userId: string;
  onComplete: () => void;
}

interface OnboardingData {
  username: string;
  templateId: TemplateId | null;
  backgroundPattern: BackgroundPattern;
}

interface FlashDot {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const TOTAL = 4;
const FLASH_COLORS = ['#22c55e', '#86efac', '#FFDE4D', '#4ade80'];

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
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showFlashes, setShowFlashes] = useState(false);
  const [flashes] = useState<FlashDot[]>(buildFlashes);
  const [data, setData] = useState<OnboardingData>({ username: '', templateId: null, backgroundPattern: 'none' });
  const router = useRouter();

  const canProceed =
    (step === 1 && data.username.trim().length >= 2) ||
    (step === 2 && data.templateId !== null) ||
    step === 3;

  const next = () => setStep(s => Math.min(s + 1, TOTAL));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleFinalize = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowFlashes(true);

    const supabase = createClient();
    const template = BOARD_TEMPLATES.find(t => t.id === data.templateId);
    const trimmed = data.username.trim();

    // Persist operator tag to profile
    await supabase
      .from('profiles')
      .upsert({ id: userId, username: trimmed, background_pattern: data.backgroundPattern, updated_at: new Date().toISOString() });

    // Create starter board from selected template
    if (template) {
      const statusAttr = template.schema.attributes.find(a => a.id === 'status');
      const columnOrder = statusAttr?.options ?? template.defaultColumns;
      await supabase.from('boards').insert({
        user_id: userId,
        title: `${trimmed}'s ${template.name}`,
        config: {
          view: 'kanban',
          visible_attributes: template.schema.attributes.filter(a => a.isEnabled).map(a => a.id),
          column_order: columnOrder,
        },
        schema_definition: template.schema,
      });
    }

    // Let flash animation play, then unmount and refresh server data
    setTimeout(() => {
      setShowFlashes(false);
      onComplete();
      router.refresh();
    }, 1900);
  }, [submitting, data, userId, router, onComplete]);

  // Step indicator blocks: ⬛ = done/current, ⬜ = upcoming
  const blocks = Array.from({ length: TOTAL }, (_, i) => (i < step ? '⬛' : '⬜'));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(20px) saturate(0.4)', backgroundColor: 'rgba(0,0,0,0.78)' }}
    >
      {/* ── Green flash explosion ── */}
      {showFlashes && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 60 }}>
          {flashes.map(d => (
            <div
              key={d.id}
              className="absolute rounded-full"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: d.size,
                height: d.size,
                backgroundColor: d.color,
                animation: `kbFlash 0.95s ${d.delay}s ease-out both`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* ── Step tracker ── */}
        <div className="flex items-center gap-3 mb-5 select-none">
          <span className="font-mono text-[13px] text-[#FFDE4D] tracking-widest leading-none">
            [{' '}{blocks.join(' ')}{' '}]
          </span>
          <span className="font-mono text-[11px] text-zinc-600 tracking-widest">
            STEP {String(step).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
            KUROBOX INIT
          </span>
        </div>

        {/* ── Step card ── */}
        <div
          key={`step-${step}`}
          className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden"
          style={{
            boxShadow: '4px 4px 0px #27272a',
            animation: 'kbStepIn 0.24s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {step === 1 && (
            <StepIdentity
              username={data.username}
              onChange={v => setData(d => ({ ...d, username: v }))}
            />
          )}
          {step === 2 && (
            <StepDataDeck
              selected={data.templateId}
              onSelect={id => setData(d => ({ ...d, templateId: id }))}
            />
          )}
          {step === 3 && (
            <StepProtocol
              backgroundPattern={data.backgroundPattern}
              onPatternChange={p => setData(d => ({ ...d, backgroundPattern: p }))}
            />
          )}
          {step === 4 && (
            <StepFinalize
              username={data.username}
              templateId={data.templateId}
              onFinalize={handleFinalize}
              submitting={submitting}
            />
          )}

          {/* ── Footer nav (steps 1–3 only) ── */}
          {step < 4 && (
            <div className="flex items-center justify-between px-6 pb-5 pt-3 border-t border-zinc-800/50">
              <button
                onClick={back}
                disabled={step === 1}
                className="font-mono text-[10px] text-zinc-600 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors uppercase tracking-widest cursor-pointer"
              >
                ← BACK
              </button>

              <div className="flex items-center gap-3">
                {/* Mini step dots */}
                <div className="flex gap-1">
                  {Array.from({ length: TOTAL }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === step - 1 ? 14 : 5,
                        height: 5,
                        backgroundColor: i < step ? '#FFDE4D' : '#27272a',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  disabled={!canProceed}
                  className="font-mono text-[10px] font-bold bg-[#FFDE4D] text-black px-5 py-2.5 hover:bg-[#FFE869] active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest cursor-pointer rounded-sm"
                >
                  {step === 3 ? 'READY →' : 'NEXT →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Global keyframes (self-contained) ── */}
      <style>{`
        @keyframes kbStepIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes kbFlash {
          0%   { opacity: 0; transform: scale(0)   translateY(0px);   }
          35%  { opacity: 1; transform: scale(1.7) translateY(-4px);  }
          100% { opacity: 0; transform: scale(0.3) translateY(-28px); }
        }
      `}</style>
    </div>
  );
}
