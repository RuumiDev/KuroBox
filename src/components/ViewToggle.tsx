'use client';

import { LayoutGrid, Table } from 'lucide-react';

interface ViewToggleProps {
  view: 'kanban' | 'table';
  onChange: (view: 'kanban' | 'table') => void;
}

const VIEWS = [
  { id: 'kanban' as const, icon: LayoutGrid, label: 'Kanban', kanji: '看板' },
  { id: 'table'  as const, icon: Table,      label: 'Table',  kanji: '台帳' },
];

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex border border-zinc-800 rounded-sm overflow-hidden">
      {VIEWS.map(({ id, icon: Icon, label, kanji }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={view === id}
          className={`flex flex-col items-center gap-0 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE4D] ${
            view === id
              ? 'bg-[#FFDE4D] text-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Icon size={13} />
            {label}
          </span>
          <span className="text-[7px] opacity-60 leading-none">{kanji}</span>
        </button>
      ))}
    </div>
  );
}
