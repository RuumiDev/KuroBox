'use client';

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
  const visibleAttrs = board.schema_definition.attributes.filter(a => a.isEnabled);

  const sorted = [...cards].sort((a, b) => {
    if (a.status !== b.status) return a.status.localeCompare(b.status);
    return a.sort_order - b.sort_order;
  });

  const updateAttr = (cardId: string, attrId: string, value: unknown) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    onUpdateCard(cardId, {
      attributes_data: { ...card.attributes_data, [attrId]: value },
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm min-w-max">
        <thead>
          <tr className="border-b border-zinc-800">
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
          {sorted.map(card => (
            <tr
              key={card.id}
              className="border-b border-zinc-900 hover:bg-zinc-800/50 transition-colors group"
            >
              {visibleAttrs.map(attr => (
                <td
                  key={attr.id}
                  className="px-4 py-1.5 cursor-pointer"
                  onClick={() => {
                    // Open modal on title or markdown cells; inline-edit for the rest
                    if (attr.required || attr.type === 'markdown') onCardClick(card);
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
          ))}

          {/* Add row */}
          <tr>
            <td colSpan={visibleAttrs.length + 1} className="px-4 py-2">
              <button
                onClick={onAddCard}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-[#FFDE4D] transition-colors cursor-pointer"
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
