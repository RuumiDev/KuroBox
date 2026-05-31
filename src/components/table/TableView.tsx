'use client';

import { useState, useCallback } from 'react';
import { Board, Card } from '@/types';
import TableCell from './TableCell';
import { Plus, Trash2 } from 'lucide-react';

interface TableViewProps {
  board: Board;
  cards: Card[];
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: () => void;
  onCardClick: (card: Card) => void;
}

export default function TableView({
  board,
  cards,
  onUpdateCard,
  onDeleteCard,
  onAddCard,
  onCardClick,
}: TableViewProps) {
  const [flashMap, setFlashMap] = useState<Record<string, boolean>>({});

  const visibleAttrs = board.schema_definition.attributes.filter(a => a.isEnabled && a.id !== 'status');
  const columnOrder = board.config.column_order.length > 0
    ? board.config.column_order
    : (board.schema_definition.attributes.find(a => a.id === 'status')?.options ?? []);

  const triggerFlash = useCallback((cardId: string) => {
    setFlashMap(p => ({ ...p, [cardId]: true }));
    setTimeout(() => setFlashMap(p => ({ ...p, [cardId]: false })), 350);
  }, []);

  const updateAttr = (cardId: string, attrId: string, value: unknown) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    onUpdateCard(cardId, {
      attributes_data: { ...card.attributes_data, [attrId]: value },
    });
    triggerFlash(cardId);
  };

  const updateStatus = (cardId: string, newStatus: string) => {
    onUpdateCard(cardId, { status: newStatus });
    triggerFlash(cardId);
  };

  // Group cards by column_order sequence, then sort_order within each group
  const grouped = columnOrder.map(col => ({
    status: col,
    rows: cards
      .filter(c => c.status === col)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  // Cards whose status doesn't match any column (orphaned — show at bottom)
  const knownStatuses = new Set(columnOrder);
  const orphaned = cards.filter(c => !knownStatuses.has(c.status));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm min-w-max">
        <thead>
          <tr className="border-b border-zinc-800">
            {/* Status column — always first */}
            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
              Status
            </th>
            {visibleAttrs.map(attr => (
              <th
                key={attr.id}
                className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap"
              >
                {attr.name}
              </th>
            ))}
            {/* Actions column */}
            <th className="w-10 py-2.5" />
          </tr>
        </thead>

        <tbody>
          {grouped.map(({ status, rows }) =>
            rows.map((card, rowIdx) => (
              <tr
                key={card.id}
                className={[
                  'border-b border-zinc-900 hover:bg-zinc-800/50 transition-colors group',
                  flashMap[card.id] ? 'flash-commit' : '',
                ].join(' ')}
              >
                {/* Left status accent border — first row of group gets full accent, rest are muted */}
                <td
                  className={[
                    'px-4 py-1.5 whitespace-nowrap',
                    rowIdx === 0
                      ? 'border-l-2 border-l-[var(--kb-accent)]'
                      : 'border-l-2 border-l-[var(--kb-accent)]/20',
                  ].join(' ')}
                >
                  <select
                    value={card.status}
                    onChange={e => updateStatus(card.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="bg-transparent border-none text-xs text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    {columnOrder.map(opt => (
                      <option key={opt} value={opt} className="bg-zinc-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {visibleAttrs.map(attr => (
                  <td
                    key={attr.id}
                    className="px-4 py-1.5 cursor-pointer"
                    onClick={() => {
                      if (attr.type === 'markdown') onCardClick(card);
                    }}
                  >
                    <TableCell
                      attr={attr}
                      value={card.attributes_data[attr.id]}
                      onChange={val => updateAttr(card.id, attr.id, val)}
                      onExpand={() => onCardClick(card)}
                    />
                  </td>
                ))}

                <td className="px-2 py-1.5">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteCard(card.id);
                    }}
                    title="Delete row"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-sm text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))
          )}

          {/* Orphaned cards (status not in any column) */}
          {orphaned.map(card => (
            <tr
              key={card.id}
              className={[
                'border-b border-zinc-900 hover:bg-zinc-800/50 transition-colors group',
                flashMap[card.id] ? 'flash-commit' : '',
              ].join(' ')}
            >
              <td className="px-4 py-1.5 border-l-2 border-l-zinc-700 whitespace-nowrap">
                <select
                  value={card.status}
                  onChange={e => updateStatus(card.id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="bg-transparent border-none text-xs text-zinc-500 italic focus:outline-none cursor-pointer"
                >
                  <option value={card.status} className="bg-zinc-900">{card.status}</option>
                  {columnOrder.map(opt => (
                    <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                  ))}
                </select>
              </td>
              {visibleAttrs.map(attr => (
                <td key={attr.id} className="px-4 py-1.5">
                  <TableCell
                    attr={attr}
                    value={card.attributes_data[attr.id]}
                    onChange={val => updateAttr(card.id, attr.id, val)}
                    onExpand={() => onCardClick(card)}
                  />
                </td>
              ))}
              <td className="px-2 py-1.5">
                <button
                  onClick={e => { e.stopPropagation(); onDeleteCard(card.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-sm text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}

          {/* Add row */}
          <tr>
            <td colSpan={visibleAttrs.length + 2} className="px-4 py-2">
              <button
                onClick={onAddCard}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-[var(--kb-accent)] transition-colors cursor-pointer"
              >
                <Plus size={13} /> New row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
