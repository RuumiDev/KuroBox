'use client';

import { useRef, useState } from 'react';
import { AttributeField } from '@/types';
import { ExternalLink, FileText, Calendar, ChevronDown } from 'lucide-react';

interface TableCellProps {
  attr: AttributeField;
  value: unknown;
  onChange: (value: unknown) => void;
  onExpand: () => void;
}

// ── Shared edit-mode input style ──────────────────────────────────────────────
const INPUT_BASE =
  'bg-[var(--kb-surface-alt)] border border-[var(--kb-border)] text-xs text-[var(--kb-text)] rounded-sm px-2 py-1 focus:outline-none focus:border-[var(--kb-accent)] w-full min-w-[80px] transition-colors';

// ── Display mode helpers ──────────────────────────────────────────────────────
function EmptyCell({ onDoubleClick }: { onDoubleClick: () => void }) {
  return (
    <span
      onDoubleClick={onDoubleClick}
      className="block text-[11px] text-zinc-700 italic cursor-text select-none min-w-[60px] px-1 py-0.5"
    >
      —
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TableCell({ attr, value, onChange, onExpand }: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const strVal = (value as string) ?? '';

  const startEdit = () => {
    setIsEditing(true);
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopEdit = () => setIsEditing(false);

  // ── Markdown — always display-only, click opens modal ────────────────────
  if (attr.type === 'markdown') {
    return (
      <button
        onClick={e => { e.stopPropagation(); onExpand(); }}
        title="Open to edit"
        className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer max-w-[200px]"
      >
        <FileText size={11} />
        <span className="truncate italic">
          {strVal ? strVal.slice(0, 50) + (strVal.length > 50 ? '…' : '') : 'Click to edit'}
        </span>
      </button>
    );
  }

  // ── Select ────────────────────────────────────────────────────────────────
  if (attr.type === 'select') {
    if (!isEditing) {
      return strVal ? (
        <span
          onDoubleClick={startEdit}
          className="inline-flex items-center gap-1 text-[11px] bg-zinc-800/60 text-zinc-300 px-2 py-0.5 rounded-sm cursor-pointer select-none hover:bg-zinc-700/50 transition-colors"
        >
          {strVal}
          <ChevronDown size={9} className="text-zinc-600" />
        </span>
      ) : (
        <EmptyCell onDoubleClick={startEdit} />
      );
    }
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={strVal}
        autoFocus
        onChange={e => { onChange(e.target.value); stopEdit(); }}
        onBlur={stopEdit}
        onClick={e => e.stopPropagation()}
        className={INPUT_BASE + ' cursor-pointer'}
      >
        <option value="" className="bg-zinc-900 text-zinc-500">—</option>
        {attr.options?.map(opt => (
          <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
        ))}
      </select>
    );
  }

  // ── Date ─────────────────────────────────────────────────────────────────
  if (attr.type === 'date') {
    if (!isEditing) {
      const formatted = strVal
        ? new Date(strVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
        : '';
      return formatted ? (
        <span
          onDoubleClick={startEdit}
          className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-800/30 px-1.5 py-0.5 rounded-sm cursor-pointer font-mono hover:bg-zinc-800/50 transition-colors"
        >
          <Calendar size={9} className="text-zinc-600" />
          {formatted}
        </span>
      ) : (
        <EmptyCell onDoubleClick={startEdit} />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="date"
        value={strVal}
        autoFocus
        onChange={e => onChange(e.target.value)}
        onBlur={stopEdit}
        onClick={e => e.stopPropagation()}
        className={INPUT_BASE}
      />
    );
  }

  // ── URL ──────────────────────────────────────────────────────────────────
  if (attr.type === 'url') {
    if (!isEditing) {
      return strVal ? (
        <div className="flex items-center gap-1.5">
          <span
            onDoubleClick={startEdit}
            className="text-[11px] text-zinc-400 truncate max-w-[140px] cursor-pointer hover:text-zinc-200 transition-colors"
          >
            {strVal.replace(/^https?:\/\//, '').split('/')[0]}
          </span>
          <a
            href={strVal}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-zinc-600 hover:text-[var(--kb-accent)] transition-colors shrink-0"
          >
            <ExternalLink size={10} />
          </a>
        </div>
      ) : (
        <EmptyCell onDoubleClick={startEdit} />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="url"
        value={strVal}
        autoFocus
        onChange={e => onChange(e.target.value)}
        onBlur={stopEdit}
        onClick={e => e.stopPropagation()}
        placeholder="https://…"
        className={INPUT_BASE + ' max-w-[200px]'}
      />
    );
  }

  // ── Short text (default) ──────────────────────────────────────────────────
  if (!isEditing) {
    return strVal ? (
      <span
        onDoubleClick={startEdit}
        className="block text-[11px] text-zinc-200 truncate max-w-[220px] cursor-text hover:text-white transition-colors px-1 py-0.5"
      >
        {strVal}
      </span>
    ) : (
      <EmptyCell onDoubleClick={startEdit} />
    );
  }
  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={strVal}
      autoFocus
      onChange={e => onChange(e.target.value)}
      onBlur={stopEdit}
      onClick={e => e.stopPropagation()}
      placeholder="—"
      className={INPUT_BASE}
    />
  );
}
