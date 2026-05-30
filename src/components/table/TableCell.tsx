'use client';

import { AttributeField } from '@/types';
import Badge from '@/components/ui/Badge';
import { ExternalLink, FileText } from 'lucide-react';

interface TableCellProps {
  attr: AttributeField;
  value: unknown;
  onChange: (value: unknown) => void;
  onExpand: () => void;
}

export default function TableCell({ attr, value, onChange, onExpand }: TableCellProps) {
  const strVal = (value as string) ?? '';

  const inputBase =
    'bg-transparent border-none text-xs text-white focus:outline-none w-full min-w-[80px] placeholder-zinc-700';

  switch (attr.type) {
    case 'select':
      return (
        <select
          value={strVal}
          onChange={e => onChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
        >
          <option value="" className="bg-zinc-900 text-zinc-500">
            —
          </option>
          {attr.options?.map(opt => (
            <option key={opt} value={opt} className="bg-zinc-900">
              {opt}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={strVal}
          onChange={e => onChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          className="bg-transparent border-none text-xs text-zinc-300 focus:outline-none cursor-pointer"
        />
      );

    case 'url':
      return (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <input
            type="url"
            value={strVal}
            onChange={e => onChange(e.target.value)}
            placeholder="https://…"
            className={`${inputBase} max-w-[160px]`}
          />
          {strVal && (
            <a
              href={strVal}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-[#FFDE4D] transition-colors"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      );

    case 'markdown':
      return (
        <button
          onClick={e => {
            e.stopPropagation();
            onExpand();
          }}
          title="Open to edit"
          className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer max-w-[200px]"
        >
          <FileText size={11} />
          <span className="truncate italic">
            {strVal ? strVal.slice(0, 50) + (strVal.length > 50 ? '…' : '') : 'Click to edit'}
          </span>
        </button>
      );

    default: // short_text
      return (
        <input
          type="text"
          value={strVal}
          onChange={e => onChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder="—"
          className={inputBase}
        />
      );
  }
}
