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
      {/* Centered columns layout — transparent so wallpaper shows through */}
      <div className="flex gap-6 w-full justify-center items-start mx-auto px-4 max-w-7xl h-full overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
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
