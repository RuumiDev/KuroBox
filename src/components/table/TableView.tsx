'use client';

import { useState, useCallback } from 'react';
import { Board, Card } from '@/types';
import TableCell from './TableCell';
import { Plus, Trash2, ChevronRight } from 'lucide-react';

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
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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

  const toggleGroup = (status: string) =>
    setCollapsedGroups(p => ({ ...p, [status]: !p[status] }));

  // Group cards by column_order sequence, sort within each group
  const grouped = columnOrder.map(col => ({
    status: col,
    rows: cards
      .filter(c => c.status === col)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  const knownStatuses = new Set(columnOrder);
  const orphaned = cards.filter(c => !knownStatuses.has(c.status));

  const colSpan = visibleAttrs.length + 2; // status + attrs + actions

  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="w-full text-sm min-w-max border-separate border-spacing-y-1.5">
        {/* ── Header ── */}
        <thead>
          <tr>
            <th className="text-left px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 whitespace-nowrap">
              Status
            </th>
            {visibleAttrs.map(attr => (
              <th
                key={attr.id}
                className="text-left px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 whitespace-nowrap"
              >
                {attr.name}
              </th>
            ))}
            <th className="w-10 pb-2" />
          </tr>
        </thead>

        <tbody>
          {grouped.map(({ status, rows }) => (
            <>
              {/* ── Group header slab ── */}
              <tr key={`group-${status}`}>
                <td
                  colSpan={colSpan}
                  className="px-3 py-1.5 bg-[var(--kb-surface)]/60 rounded-md"
                >
                  <button
                    onClick={() => toggleGroup(status)}
                    className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ChevronRight
                      size={11}
                      className={['transition-transform', collapsedGroups[status] ? '' : 'rotate-90'].join(' ')}
                    />
                    <span className="text-[var(--kb-accent)]">{status}</span>
                    <span className="text-zinc-700 font-normal normal-case tracking-normal ml-1">
                      {rows.length} {rows.length === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                </td>
              </tr>

              {/* ── Row slabs ── */}
              {!collapsedGroups[status] && rows.map(card => (
                <tr
                  key={card.id}
                  className={[
                    'group transition-all duration-150',
                    flashMap[card.id] ? 'flash-commit' : '',
                  ].join(' ')}
                >
                  {/* Status cell */}
                  <td className="px-3 py-2 bg-[var(--kb-surface)] rounded-l-md whitespace-nowrap border-l-2 border-l-[var(--kb-accent)]/30 hover:border-l-[var(--kb-accent)] transition-colors">
                    <select
                      value={card.status}
                      onChange={e => updateStatus(card.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="bg-transparent border-none text-xs text-zinc-400 focus:outline-none cursor-pointer"
                    >
                      {columnOrder.map(opt => (
                        <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* Attribute cells */}
                  {visibleAttrs.map((attr, attrIdx) => (
                    <td
                      key={attr.id}
                      className={[
                        'px-3 py-2 bg-[var(--kb-surface)] hover:bg-[var(--kb-surface-alt)] transition-colors',
                        attrIdx === visibleAttrs.length - 1 && 'pr-4',
                      ].join(' ')}
                      onDoubleClick={() => {
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

                  {/* Actions */}
                  <td className="px-2 py-2 bg-[var(--kb-surface)] rounded-r-md">
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteCard(card.id); }}
                      title="Delete row"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-sm text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </>
          ))}

          {/* ── Orphaned cards ── */}
          {orphaned.length > 0 && (
            <>
              <tr key="group-orphaned">
                <td colSpan={colSpan} className="px-3 py-1.5 bg-[var(--kb-surface)]/40 rounded-md">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-700">
                    Unassigned
                  </span>
                </td>
              </tr>
              {orphaned.map(card => (
                <tr key={card.id} className="group transition-all duration-150">
                  <td className="px-3 py-2 bg-[var(--kb-surface)] rounded-l-md whitespace-nowrap border-l-2 border-l-zinc-700">
                    <select
                      value={card.status}
                      onChange={e => updateStatus(card.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="bg-transparent border-none text-xs text-zinc-600 italic focus:outline-none cursor-pointer"
                    >
                      <option value={card.status} className="bg-zinc-900">{card.status}</option>
                      {columnOrder.map(opt => (
                        <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                      ))}
                    </select>
                  </td>
                  {visibleAttrs.map(attr => (
                    <td key={attr.id} className="px-3 py-2 bg-[var(--kb-surface)] hover:bg-[var(--kb-surface-alt)] transition-colors">
                      <TableCell
                        attr={attr}
                        value={card.attributes_data[attr.id]}
                        onChange={val => updateAttr(card.id, attr.id, val)}
                        onExpand={() => onCardClick(card)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 bg-[var(--kb-surface)] rounded-r-md">
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteCard(card.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-sm text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </>
          )}

          {/* ── Add row ── */}
          <tr>
            <td colSpan={colSpan} className="pt-2 px-3">
              <button
                onClick={onAddCard}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-[var(--kb-accent)] transition-colors cursor-pointer"
              >
                <Plus size={13} />
                Add row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
