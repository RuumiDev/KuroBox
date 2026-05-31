'use client';

import { useState } from 'react';
import { Card, Board, AttributeField } from '@/types';
import { X, Trash2, ExternalLink } from 'lucide-react';

interface CardModalProps {
  card: Card;
  board: Board;
  onUpdate: (updates: Partial<Card>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function CardModal({
  card,
  board,
  onUpdate,
  onDelete,
  onClose,
}: CardModalProps) {
  const [status, setStatus] = useState(card.status);
  const [data, setData] = useState<Record<string, unknown>>(card.attributes_data);

  const attrs = board.schema_definition.attributes.filter(a => a.isEnabled);
  // Status options driven by the pipeline column_order (single source of truth)
  const statusOptions =
    board.config.column_order.length > 0
      ? board.config.column_order
      : (board.schema_definition.attributes.find(a => a.id === 'status')?.options ?? []);

  const handleAttrChange = (attrId: string, value: unknown) => {
    const next = { ...data, [attrId]: value };
    setData(next);
    onUpdate({ attributes_data: next });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    onUpdate({ status: val });
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    /* Glassmorphism overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 backdrop-blur-xl bg-black/60" aria-hidden="true" />

      <div
        className="relative z-10 bg-zinc-950 border border-zinc-800 rounded-sm w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
          <span className="text-[10px] font-mono text-zinc-600">
            {card.id.slice(0, 8).toUpperCase()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              title="Delete card"
              className="p-1.5 rounded-sm text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-sm text-zinc-600 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFDE4D]"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-6">
          {/* Status selector */}
          {statusOptions.length > 0 && (
            <div>
              <label className="field-label">Status</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {statusOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleStatusChange(opt)}
                    className={[
                      'text-xs px-3 py-1 rounded-sm border transition-colors cursor-pointer',
                      status === opt
                        ? 'border-[#FFDE4D] text-[#FFDE4D] bg-[#FFDE4D]/10'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All other attributes */}
          {attrs
            .filter(a => a.id !== 'status')
            .map(attr => (
              <AttributeInput
                key={attr.id}
                attr={attr}
                value={data[attr.id]}
                onChange={val => handleAttrChange(attr.id, val)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Attribute input sub-component ───────────────────────────────────────────

function AttributeInput({
  attr,
  value,
  onChange,
}: {
  attr: AttributeField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const strVal = (value as string) ?? '';
  const inputBase =
    'w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors';

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
        {attr.name}
      </label>

      {attr.type === 'short_text' && (
        <input
          type="text"
          value={strVal}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${attr.name.toLowerCase()}…`}
          className={inputBase}
        />
      )}

      {attr.type === 'markdown' && (
        <textarea
          value={strVal}
          onChange={e => onChange(e.target.value)}
          rows={6}
          placeholder="Markdown supported…"
          className={`${inputBase} resize-y font-mono text-xs leading-relaxed`}
        />
      )}

      {attr.type === 'select' && (
        <div className="flex flex-wrap gap-2">
          {attr.options?.map(opt => (
            <button
              key={opt}
              onClick={() => onChange(strVal === opt ? '' : opt)}
              className={[
                'text-xs px-3 py-1 rounded-sm border transition-colors cursor-pointer',
                strVal === opt
                  ? 'border-[#FFDE4D] text-[#FFDE4D] bg-[#FFDE4D]/10'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {attr.type === 'date' && (
        <input
          type="date"
          value={strVal}
          onChange={e => onChange(e.target.value)}
          className={`${inputBase} w-auto cursor-pointer`}
        />
      )}

      {attr.type === 'url' && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={strVal}
            onChange={e => onChange(e.target.value)}
            placeholder="https://…"
            className={`${inputBase} flex-1`}
          />
          {strVal && (
            <a
              href={strVal}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-zinc-800 rounded-sm text-zinc-500 hover:text-[#FFDE4D] hover:border-[#FFDE4D] transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {attr.type === 'file' && (
        <div className="border border-dashed border-zinc-800 rounded-sm p-5 text-center">
          <p className="text-xs text-zinc-600">
            Attachments require a Supabase Storage bucket.
          </p>
          <p className="text-[10px] text-zinc-700 mt-1">
            Configure <code>SUPABASE_STORAGE_BUCKET</code> and enable in the Supabase dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
