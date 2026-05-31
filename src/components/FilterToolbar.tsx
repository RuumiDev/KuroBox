'use client';

import { useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AttributeField, Card } from '@/types';

export interface ActiveFilter {
  attrId: string;
  attrName: string;
  value: string;
}

interface FilterToolbarProps {
  schema: AttributeField[];
  cards: Card[];
  filterText: string;
  activeFilters: ActiveFilter[];
  onFilterTextChange: (t: string) => void;
  onAddFilter: (f: ActiveFilter) => void;
  onRemoveFilter: (attrId: string, value: string) => void;
  onClearAll: () => void;
}

export default function FilterToolbar({
  schema,
  cards,
  filterText,
  activeFilters,
  onFilterTextChange,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
}: FilterToolbarProps) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Only select-type attributes with available options
  const selectAttrs = schema.filter(a => a.isEnabled && a.type === 'select' && a.id !== 'status');

  // Collect all unique option values actually present in cards
  const availableOptions: Record<string, Set<string>> = {};
  for (const attr of selectAttrs) {
    availableOptions[attr.id] = new Set();
    for (const card of cards) {
      const v = card.attributes_data[attr.id] as string | undefined;
      if (v) availableOptions[attr.id].add(v);
    }
  }

  const isActive = filterText.length > 0 || activeFilters.length > 0;

  return (
    <div className="shrink-0 border-b border-[var(--kb-border-subtle)] px-4 py-2 flex items-center gap-2 bg-[var(--kb-bg)]">
      {/* ── Text search ── */}
      <div className="relative flex items-center flex-1 max-w-xs">
        <Search size={12} className="absolute left-2.5 text-zinc-600 pointer-events-none" />
        <input
          type="text"
          value={filterText}
          onChange={e => onFilterTextChange(e.target.value)}
          placeholder="Search cards…"
          className="w-full bg-[var(--kb-surface)] border border-[var(--kb-border)] text-xs text-[var(--kb-text)] rounded-sm pl-7 pr-3 py-1.5 focus:outline-none focus:border-[var(--kb-accent)] placeholder-zinc-700 transition-colors"
        />
        {filterText && (
          <button
            onClick={() => onFilterTextChange('')}
            className="absolute right-2 text-zinc-600 hover:text-zinc-400 cursor-pointer"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* ── Tag filter toggle ── */}
      {selectAttrs.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowPopover(p => !p)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-xs transition-colors cursor-pointer',
              showPopover
                ? 'border-[var(--kb-accent)] text-[var(--kb-accent)] bg-[var(--kb-accent)]/5'
                : 'border-[var(--kb-border)] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
            ].join(' ')}
          >
            <SlidersHorizontal size={11} />
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider">Filter</span>
          </button>

          {showPopover && (
            <div
              ref={popoverRef}
              className="absolute top-full left-0 mt-1.5 z-50 bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-sm shadow-xl w-52 py-1"
            >
              {selectAttrs.map(attr => {
                const opts = Array.from(availableOptions[attr.id] ?? attr.options ?? []);
                if (opts.length === 0) return null;
                return (
                  <div key={attr.id} className="px-3 py-2">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-600 mb-1.5">
                      {attr.name}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {opts.map(opt => {
                        const alreadyActive = activeFilters.some(
                          f => f.attrId === attr.id && f.value === opt
                        );
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              if (alreadyActive) {
                                onRemoveFilter(attr.id, opt);
                              } else {
                                onAddFilter({ attrId: attr.id, attrName: attr.name, value: opt });
                              }
                            }}
                            className={[
                              'text-[10px] px-2 py-0.5 rounded-sm border transition-colors cursor-pointer',
                              alreadyActive
                                ? 'border-[var(--kb-accent)] text-[var(--kb-accent)] bg-[var(--kb-accent)]/10'
                                : 'border-[var(--kb-border)] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
                            ].join(' ')}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {selectAttrs.every(a => Array.from(availableOptions[a.id] ?? []).length === 0) && (
                <p className="text-[10px] text-zinc-600 px-3 py-2 italic">No tags yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Active badge tokens ── */}
      {activeFilters.map(f => (
        <span
          key={`${f.attrId}:${f.value}`}
          className="inline-flex items-center gap-1 text-[10px] bg-[var(--kb-accent)]/10 border border-[var(--kb-accent)]/30 text-[var(--kb-accent)] px-2 py-1 rounded-sm font-mono"
        >
          {f.value}
          <button
            onClick={() => onRemoveFilter(f.attrId, f.value)}
            className="ml-0.5 text-[var(--kb-accent)]/60 hover:text-[var(--kb-accent)] transition-colors cursor-pointer"
            aria-label={`Remove ${f.value} filter`}
          >
            <X size={9} />
          </button>
        </span>
      ))}

      {/* ── Clear all ── */}
      {isActive && (
        <button
          onClick={onClearAll}
          className="ml-auto text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer font-mono uppercase tracking-wider"
        >
          Clear
        </button>
      )}
    </div>
  );
}
