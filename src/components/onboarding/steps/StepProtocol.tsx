'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface CalloutDef {
  id: string;
  label: string;
  description: string;
  color: string;
}

const CALLOUTS: CalloutDef[] = [
  {
    id: 'toggle',
    label: 'VIEW ENGINE',
    description:
      'Switch between Kanban columns and Table spreadsheet views. Same data, two lenses — zero data loss.',
    color: '#FFDE4D',
  },
  {
    id: 'schema',
    label: 'SCHEMA MANAGER',
    description:
      'Modify field types, rename columns, add or hide attributes. Your board structure is fully dynamic.',
    color: '#FF5F00',
  },
  {
    id: 'import',
    label: 'DATA IMPORTER',
    description:
      'Drag-drop a CSV or Markdown file to bulk-load hundreds of cards in seconds. Auto-detects columns.',
    color: '#22c55e',
  },
  {
    id: 'board',
    label: 'KANBAN ENGINE',
    description:
      'Drag cards between status columns. Positions sync to the database in real time with optimistic UI.',
    color: '#818cf8',
  },
];

export default function StepProtocol() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % CALLOUTS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const active = CALLOUTS[activeIdx];
  const is = (id: string) => active.id === id;

  const headerZone = (id: string, color: string, children: React.ReactNode) => (
    <div
      className="px-2 py-0.5 border rounded-sm transition-all duration-300 cursor-pointer select-none"
      style={{
        borderColor: is(id) ? color : '#27272a',
        borderStyle: is(id) ? 'dashed' : 'solid',
        boxShadow: is(id) ? `0 0 8px ${color}44` : 'none',
      }}
      onClick={() => setActiveIdx(CALLOUTS.findIndex(c => c.id === id))}
    >
      {children}
    </div>
  );

  return (
    <div className="p-6">
      {/* Module label */}
      <div className="flex items-center gap-2 mb-4">
        <Zap size={13} className="text-[#FFDE4D]" />
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
          PROTOCOL CALIBRATION · WORKSPACE OVERVIEW
        </span>
      </div>

      {/* ── Mock Dashboard Schematic ── */}
      <div className="relative border border-zinc-800 rounded-sm bg-zinc-950 mb-4 overflow-visible">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-black rounded-t-sm">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#FFDE4D] rounded-sm" />
            <span className="font-mono text-[8px] font-bold text-white">KUROBOX</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Schema */}
            {headerZone(
              'schema',
              '#FF5F00',
              <span className="font-mono text-[8px] text-zinc-500">Schema</span>,
            )}

            {/* View toggle */}
            <div
              className="flex border rounded-sm transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                borderColor: is('toggle') ? '#FFDE4D' : '#27272a',
                borderStyle: is('toggle') ? 'dashed' : 'solid',
                boxShadow: is('toggle') ? '0 0 10px #FFDE4D33' : 'none',
              }}
              onClick={() => setActiveIdx(CALLOUTS.findIndex(c => c.id === 'toggle'))}
            >
              <span className="font-mono text-[8px] px-2 py-0.5 text-white border-r border-zinc-800 select-none">
                Kanban
              </span>
              <span className="font-mono text-[8px] px-2 py-0.5 text-zinc-600 select-none">Table</span>
            </div>

            {/* Import */}
            {headerZone(
              'import',
              '#22c55e',
              <span className="font-mono text-[8px] text-zinc-500">Import</span>,
            )}
          </div>
        </div>

        {/* Kanban columns */}
        <div
          className="flex gap-2 p-3 cursor-pointer transition-all duration-300"
          style={{
            outline: is('board') ? '2px dashed #818cf8' : '2px solid transparent',
            outlineOffset: '-3px',
            boxShadow: is('board') ? 'inset 0 0 20px #818cf812' : 'none',
            minHeight: 120,
          }}
          onClick={() => setActiveIdx(CALLOUTS.findIndex(c => c.id === 'board'))}
        >
          {(['Applied', 'Interview', 'Offer', 'Rejected'] as const).map((col, i) => (
            <div key={col} className="flex-1 min-w-0">
              <div className="font-mono text-[7px] text-zinc-700 mb-1.5 uppercase tracking-wider truncate">
                {col}
              </div>
              <div className="space-y-1">
                {Array.from({ length: [2, 1, 0, 1][i] }).map((_, j) => (
                  <div
                    key={j}
                    className="h-6 bg-zinc-800 border border-zinc-700/50 rounded-sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Zone label badge (bottom-right of mock) */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span
            className="font-mono text-[8px] px-1.5 py-0.5 border rounded-sm bg-black transition-all duration-300"
            style={{ color: active.color, borderColor: active.color }}
          >
            ◈ {active.label}
          </span>
        </div>
      </div>

      {/* Active callout description */}
      <div
        className="flex items-start gap-2.5 p-3 border rounded-sm mb-3 transition-all duration-300"
        style={{ borderColor: active.color, backgroundColor: `${active.color}0d` }}
      >
        <div
          className="w-0.5 self-stretch rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: active.color }}
        />
        <div>
          <div
            className="font-mono text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: active.color }}
          >
            {active.label}
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{active.description}</p>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2">
        {CALLOUTS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveIdx(i)}
            className="rounded-full transition-all duration-300 cursor-pointer focus:outline-none"
            style={{
              width: i === activeIdx ? 20 : 6,
              height: 6,
              backgroundColor: i === activeIdx ? active.color : '#3f3f46',
            }}
          />
        ))}
      </div>
    </div>
  );
}
