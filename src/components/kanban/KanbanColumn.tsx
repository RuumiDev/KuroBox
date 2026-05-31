'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Card, AttributeField } from '@/types';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  columnId: string;
  title: string;
  cards: Card[];
  schema: AttributeField[];
  onCardClick: (card: Card) => void;
  onAddCard: () => void;
}

export default function KanbanColumn({
  columnId,
  title,
  cards,
  schema,
  onCardClick,
  onAddCard,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-[300px] shrink-0 snap-start">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 truncate max-w-[160px]">
            {title}
          </span>
          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-sm">
            {cards.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          title={`Add card to ${title}`}
          className="p-1 rounded-sm text-zinc-600 hover:text-[var(--kb-accent)] hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kb-accent)]"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone — constrained height scrolls independently */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 pr-1 overflow-y-auto scrollbar-thin p-2 rounded-sm transition-all duration-150 ${
              snapshot.isDraggingOver
                ? 'min-h-[80px] border-2 border-dashed border-[var(--kb-accent)] bg-[var(--kb-accent)]/5'
                : cards.length === 0
                ? 'min-h-[80px] h-auto border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30'
                : 'max-h-[calc(100vh-240px)] border border-zinc-800 bg-zinc-900/20'
            }`}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                schema={schema}
                onClick={() => onCardClick(card)}
              />
            ))}
            {provided.placeholder}

            {cards.length === 0 && !snapshot.isDraggingOver && (
              <button
                onClick={onAddCard}
                className="text-[11px] text-zinc-700 hover:text-zinc-500 text-center py-4 transition-colors cursor-pointer w-full"
              >
                + Add first card
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
