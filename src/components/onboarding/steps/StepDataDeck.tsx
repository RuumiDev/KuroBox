'use client';

import { Briefcase, LayoutList, Square, Check } from 'lucide-react';
import { BOARD_TEMPLATES } from '@/lib/utils/templates';
import { TemplateId } from '@/types';

interface StepDataDeckProps {
  selected: TemplateId | null;
  onSelect: (id: TemplateId) => void;
}

const TEMPLATE_META: Record<TemplateId, { icon: typeof Briefcase; accent: string }> = {
  job_tracking: { icon: Briefcase, accent: '#FFDE4D' },
  task_board:   { icon: LayoutList,  accent: '#FF5F00' },
  blank:        { icon: Square,      accent: '#a1a1aa' },
};

export default function StepDataDeck({ selected, onSelect }: StepDataDeckProps) {
  const selectedTemplate = BOARD_TEMPLATES.find(t => t.id === selected);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-white font-bold text-[15px] tracking-tight leading-none">
          DATA DECK ALLOCATION
        </h2>
        <p className="font-mono text-[10px] text-zinc-600 mt-1.5 uppercase tracking-widest">
          SELECT A STARTER PROTOCOL FOR YOUR WORKSPACE
        </p>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {BOARD_TEMPLATES.map(t => {
          const { icon: Icon, accent } = TEMPLATE_META[t.id];
          const isSelected = selected === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={[
                'relative p-3.5 border rounded-sm text-left transition-all duration-200 cursor-pointer',
                'focus:outline-none active:scale-[0.97]',
                isSelected
                  ? 'border-dashed bg-zinc-900/80'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50',
              ].join(' ')}
              style={
                isSelected
                  ? { borderColor: accent, boxShadow: `2px 2px 0px ${accent}` }
                  : {}
              }
            >
              {/* Selected badge */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-4 h-4 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: accent }}
                >
                  <Check size={10} className="text-black" strokeWidth={3} />
                </div>
              )}

              <Icon
                size={15}
                style={{ color: isSelected ? accent : '#52525b' }}
                className="mb-2.5 transition-colors"
              />
              <p className="text-[11px] font-bold text-white leading-tight">{t.name}</p>
              <p className="text-[9px] text-zinc-600 mt-1 leading-snug">{t.description}</p>
              <p className="font-mono text-[8px] text-zinc-700 mt-2.5 uppercase tracking-wider">
                {t.schema.attributes.length} fields · {t.defaultColumns.length} cols
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected columns preview */}
      {selectedTemplate && (
        <div
          className="p-3 border border-dashed rounded-sm transition-all duration-300"
          style={{
            borderColor: TEMPLATE_META[selectedTemplate.id].accent,
            backgroundColor: `${TEMPLATE_META[selectedTemplate.id].accent}08`,
          }}
        >
          <div className="font-mono text-[9px] uppercase tracking-widest mb-2"
            style={{ color: TEMPLATE_META[selectedTemplate.id].accent }}>
            COLUMN PIPELINE
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {selectedTemplate.defaultColumns.map((col, i) => (
              <span key={col} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-sm">
                  {col}
                </span>
                {i < selectedTemplate.defaultColumns.length - 1 && (
                  <span className="text-zinc-700 text-[9px]">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
