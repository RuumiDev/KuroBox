'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Power } from 'lucide-react';
import { TemplateId } from '@/types';
import { BOARD_TEMPLATES } from '@/lib/utils/templates';

interface StepFinalizeProps {
  username: string;
  templateId: TemplateId | null;
  onFinalize: () => void;
  submitting: boolean;
}

export default function StepFinalize({
  username,
  templateId,
  onFinalize,
  submitting,
}: StepFinalizeProps) {
  const template = BOARD_TEMPLATES.find(t => t.id === templateId);

  // Stable workspace ID generated once per mount
  const wsId = useRef(
    'KB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  );

  const lines = useMemo(
    () => [
      { label: 'OPERATOR_TAG      ', value: (username || 'OPERATOR').toUpperCase() },
      { label: 'STARTER_PROTOCOL  ', value: (template?.name ?? 'BLANK').toUpperCase() },
      { label: 'COLUMN_COUNT      ', value: String(template?.defaultColumns.length ?? 0) + ' STAGES' },
      { label: 'FIELD_COUNT       ', value: String(template?.schema.attributes.length ?? 0) + ' ATTRIBUTES' },
      { label: 'WORKSPACE_ID      ', value: wsId.current },
      { label: 'ENCRYPTION        ', value: 'AES-256 · RLS ENFORCED' },
      { label: 'SYNC_MODE         ', value: 'REAL-TIME · SUPABASE' },
      { label: 'SYSTEM_STATUS     ', value: 'ALL SYSTEMS NOMINAL' },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= lines.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 160);
    return () => clearTimeout(t);
  }, [visible, lines.length]);

  const fullyPrinted = visible >= lines.length;

  return (
    <div className="p-6">
      {/* Module label */}
      <div className="flex items-center gap-2 mb-5">
        <Power size={13} className="text-[#FFDE4D]" />
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
          configuration_matrix.exe
        </span>
      </div>

      {/* Terminal printout */}
      <div className="bg-black border border-zinc-800 rounded-sm p-4 mb-5 font-mono text-[11px] space-y-1.5">
        {lines.map((line, i) => (
          <div
            key={line.label}
            className="flex items-center gap-1 transition-all duration-200"
            style={{
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? 'translateY(0)' : 'translateY(4px)',
            }}
          >
            <span className="text-zinc-600 flex-shrink-0">{line.label}</span>
            <span className="flex-1 border-b border-dashed border-zinc-900/80 mx-1" />
            <span
              style={{
                color:
                  i === lines.length - 1
                    ? '#22c55e'
                    : i === lines.length - 2
                    ? '#86efac'
                    : '#FFDE4D',
              }}
            >
              {line.value}
            </span>
          </div>
        ))}

        {fullyPrinted && (
          <div className="border-t border-zinc-800 pt-2 mt-1">
            <div className="text-green-400">
              {'> READY. AWAITING LAUNCH COMMAND.'}
            </div>
            <div className="text-zinc-700 animate-pulse">{'> _'}</div>
          </div>
        )}
      </div>

      {/* Initialize button */}
      <button
        onClick={onFinalize}
        disabled={submitting || !fullyPrinted}
        className={[
          'w-full font-mono font-bold text-[13px] py-4 uppercase tracking-[0.15em]',
          'flex items-center justify-center gap-2.5 rounded-sm transition-all duration-200',
          submitting
            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
            : !fullyPrinted
            ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
            : 'bg-[#FFDE4D] text-black hover:bg-[#FFE869] active:scale-[0.98] cursor-pointer shadow-[0_0_20px_#FFDE4D33]',
        ].join(' ')}
      >
        {submitting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
            INITIALIZING...
          </>
        ) : (
          <>
            <Power size={14} />
            INITIALIZE INTERFACE
          </>
        )}
      </button>

      <p className="font-mono text-[8px] text-zinc-700 text-center mt-2.5 uppercase tracking-widest leading-relaxed">
        CREATES YOUR STARTER WORKSPACE · PERSISTS OPERATOR TAG · CANNOT BE UNDONE
      </p>
    </div>
  );
}
