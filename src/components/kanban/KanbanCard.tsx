'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, AttributeField } from '@/types';
import { Calendar, ChevronDown, ChevronRight, Link2 } from 'lucide-react';

// ── Financial field detection ─────────────────────────────────────────────────
const FINANCIAL_KEYWORDS = [
  'salary', 'rate', 'pay', 'budget', 'cost', 'amount',
  'revenue', 'income', 'compensation', 'stipend', 'price', 'fee', 'wage',
];

function isFinancial(name: string): boolean {
  const lower = name.toLowerCase();
  return FINANCIAL_KEYWORDS.some(k => lower.includes(k));
}

function formatDate(val: string): string {
  try {
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  } catch {
    return val;
  }
}

// ── Status-based semantic border tint ─────────────────────────────────────────
// Uses hardcoded semantic colors (not theme accent) so tints remain readable
// across all 4 theme engines (stealth, radiation, overdrive, whiteout).
function getStatusBorder(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('interview') || s.includes('screen') || s.includes('assess'))
    return 'border-violet-500/25';
  if (s.includes('offer') || s.includes('accept') || s.includes('hired'))
    return 'border-emerald-500/25';
  if (s.includes('reject') || s.includes('decline') || s.includes('closed') || s.includes('fail'))
    return 'border-red-500/30';
  if (s.includes('view') || s.includes('seen') || s.includes('read') || s.includes('contact'))
    return 'border-sky-500/20';
  // Default: neutral zinc border
  return 'border-zinc-800';
}

// ── Component ─────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  card: Card;
  index: number;
  schema: AttributeField[];
  onClick: () => void;
}

export default function KanbanCard({ card, index, schema, onClick }: KanbanCardProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Position-0 enabled field = dynamic title (user-controlled via schema drag order)
  const enabledFields = schema.filter(a => a.isEnabled && a.id !== 'status');
  const titleAttr = enabledFields[0] ?? schema.find(a => a.required && a.type === 'short_text');
  const title = titleAttr
    ? (card.attributes_data[titleAttr.id] as string | undefined)
    : undefined;

  // Preview = up to 5 non-title enabled fields
  const previewAttrs = enabledFields
    .filter(a => a.id !== titleAttr?.id)
    .slice(0, 5);

  const statusBorder = getStatusBorder(card.status);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={[
            'kb-card bg-zinc-900 border p-3 rounded-sm cursor-pointer select-none',
            'transition-all duration-150',
            'hover:border-zinc-600 hover:bg-zinc-800',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kb-accent)]',
            snapshot.isDragging
              ? 'scale-[1.01] rotate-1 shadow-[3px_3px_0px_var(--kb-accent)] border-[var(--kb-accent)]/40 z-50'
              : statusBorder,
          ].join(' ')}
        >
          {/* Primary title */}
          <p className="text-sm font-medium text-white leading-snug line-clamp-2">
            {title || 'Untitled'}
          </p>

          {/* Data matrix badges */}
          {previewAttrs.length > 0 && (
            <div
              className="flex flex-col gap-1 mt-2.5"
              onClick={e => e.stopPropagation()}
            >
              {previewAttrs.map(attr => {
                const value = card.attributes_data[attr.id];

                /* ── DATE — micro-calendar chip ── */
                if (attr.type === 'date') {
                  if (!value) return null;
                  return (
                    <span
                      key={attr.id}
                      className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/30 px-1.5 py-0.5 rounded-sm w-fit font-mono"
                    >
                      <Calendar size={9} className="text-zinc-600 shrink-0" />
                      {formatDate(value as string)}
                    </span>
                  );
                }

                /* ── FINANCIAL — subtle accent tint box ── */
                if (isFinancial(attr.name) && value) {
                  return (
                    <span
                      key={attr.id}
                      className="inline-flex items-center text-[10px] font-mono font-semibold text-[var(--kb-accent)] bg-[var(--kb-accent)]/8 px-2 py-0.5 rounded-sm w-fit tracking-wide"
                    >
                      {value as string}
                    </span>
                  );
                }

                /* ── MARKDOWN — truncated preview + inline accordion ── */
                if (attr.type === 'markdown') {
                  const text = (value as string) ?? '';
                  const isExpanded = !!expandedNotes[attr.id];
                  const preview = text.slice(0, 80);
                  const hasMore = text.length > 80;

                  if (!text) return null;
                  return (
                    <div key={attr.id}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (hasMore) setExpandedNotes(p => ({ ...p, [attr.id]: !p[attr.id] }));
                        }}
                        className={[
                          'flex items-start gap-1 text-left text-[10px] text-zinc-500 w-full',
                          hasMore ? 'cursor-pointer hover:text-zinc-400 transition-colors' : 'cursor-default',
                        ].join(' ')}
                      >
                        {hasMore && (
                          isExpanded
                            ? <ChevronDown size={10} className="mt-0.5 shrink-0 text-zinc-600" />
                            : <ChevronRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />
                        )}
                        <span className={isExpanded ? 'whitespace-pre-wrap break-words' : ''}>
                          {isExpanded ? text : (preview + (hasMore ? '…' : ''))}
                        </span>
                      </button>
                    </div>
                  );
                }

                /* ── URL ── */
                if (attr.type === 'url') {
                  if (!value) return null;
                  return (
                    <span key={attr.id} className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                      <Link2 size={9} />
                      Link
                    </span>
                  );
                }

                /* ── SELECT — subtle tag chip (no harsh border) ── */
                if (attr.type === 'select') {
                  if (!value) return null;
                  return (
                    <span
                      key={attr.id}
                      className="inline-flex items-center text-[10px] bg-zinc-800/60 text-zinc-400 px-1.5 py-0.5 rounded-sm w-fit"
                    >
                      {value as string}
                    </span>
                  );
                }

                /* ── SHORT TEXT ── */
                if (!value) return null;
                return (
                  <span key={attr.id} className="text-[10px] text-zinc-500 truncate max-w-[200px] block">
                    {value as string}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
