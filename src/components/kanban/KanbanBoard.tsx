'use client';

import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Board, Card } from '@/types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  board: Board;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onMoveCard: (cardId: string, newStatus: string, newOrder: number) => void;
  onCreateCard: (status: string) => void;
}

export default function KanbanBoard({
  board,
  cards,
  onCardClick,
  onMoveCard,
  onCreateCard,
}: KanbanBoardProps) {
  const columns =
    board.config.column_order.length > 0
      ? board.config.column_order
      : (board.schema_definition.attributes.find(a => a.id === 'status')?.options ?? []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    onMoveCard(draggableId, destination.droppableId, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Full-width horizontal scroll track — no max-w clipping, columns scale freely */}
      <div className="w-full flex justify-start items-start overflow-x-auto px-8 py-4 gap-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {columns.map(column => (
          <KanbanColumn
            key={column}
            columnId={column}
            title={column}
            cards={cards
              .filter(c => c.status === column)
              .sort((a, b) => a.sort_order - b.sort_order)}
            schema={board.schema_definition.attributes}
            onCardClick={onCardClick}
            onAddCard={() => onCreateCard(column)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
