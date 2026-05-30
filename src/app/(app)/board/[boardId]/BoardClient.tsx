'use client';

import { useState } from 'react';
import { Board, Card } from '@/types';
import { useBoard } from '@/lib/hooks/useBoard';
import { useCards } from '@/lib/hooks/useCards';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TableView from '@/components/table/TableView';
import SchemaManager from '@/components/schema/SchemaManager';
import UniversalImporter from '@/components/importer/UniversalImporter';
import CardModal from '@/components/CardModal';
import ViewToggle from '@/components/ViewToggle';
import Button from '@/components/ui/Button';
import { ArrowLeft, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import { ImportResult } from '@/lib/utils/importers';
import ThemeSelector from '@/components/navigation/ThemeSelector';

interface BoardClientProps {
  initialBoard: Board;
  initialCards: Card[];
}

export default function BoardClient({ initialBoard, initialCards }: BoardClientProps) {
  const { board, updateConfig, updateSchema } = useBoard(initialBoard.id, initialBoard);
  const { cards, createCard, updateCard, deleteCard, moveCard, bulkInsertCards } = useCards(
    initialBoard.id,
    initialCards
  );

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  // Prefer live hook data, fall back to initial server data
  const currentBoard = board ?? initialBoard;
  const view = currentBoard.config.view;

  const getFirstColumn = () =>
    currentBoard.config.column_order[0] ??
    currentBoard.schema_definition.attributes.find(a => a.id === 'status')?.options?.[0] ??
    'Default';

  const handleImport = async (result: ImportResult) => {
    await updateSchema({ attributes: result.schema });
    await updateConfig({ column_order: result.columns });
    await bulkInsertCards(result.cards);
  };

  // Sync card state with active card when it gets updated
  const getActiveCard = () =>
    activeCard ? (cards.find(c => c.id === activeCard.id) ?? activeCard) : null;

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* ── Top toolbar ─────────────────────────────── */}
      <header className="shrink-0 border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-sm transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>

        <div className="w-px h-4 bg-zinc-800" />

        <h1 className="text-sm font-semibold text-white flex-1 truncate">
          {currentBoard.title}
        </h1>

        {/* Mobile: column tab switcher (visible only on sm and below) */}
        <div className="flex sm:hidden overflow-x-auto gap-1">
          {currentBoard.config.column_order.map(col => (
            <span
              key={col}
              className="text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-sm whitespace-nowrap text-zinc-400"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeSelector />
          <ViewToggle view={view} onChange={v => updateConfig({ view: v })} />
          <Button
            variant="ghost"
            onClick={() => setShowImporter(true)}
            icon={<Upload size={13} />}
          >
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowSchema(true)}
            icon={<Settings size={13} />}
          >
            <span className="hidden sm:inline">Schema</span>
          </Button>
        </div>
      </header>

      {/* ── Board content ────────────────────────────── */}
      <div className="flex-1 overflow-hidden p-4">
        {view === 'kanban' ? (
          <KanbanBoard
            board={currentBoard}
            cards={cards}
            onCardClick={setActiveCard}
            onMoveCard={moveCard}
            onCreateCard={status => createCard(status)}
          />
        ) : (
          <TableView
            board={currentBoard}
            cards={cards}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onAddCard={() => createCard(getFirstColumn())}
            onCardClick={setActiveCard}
          />
        )}
      </div>

      {/* ── Overlays ─────────────────────────────────── */}
      {activeCard && (() => {
        const card = getActiveCard()!;
        return (
          <CardModal
            card={card}
            board={currentBoard}
            onUpdate={updates => updateCard(card.id, updates)}
            onDelete={() => {
              deleteCard(card.id);
              setActiveCard(null);
            }}
            onClose={() => setActiveCard(null)}
          />
        );
      })()}

      {showSchema && (
        <SchemaManager
          schema={currentBoard.schema_definition}
          onSave={updateSchema}
          onClose={() => setShowSchema(false)}
        />
      )}

      {showImporter && (
        <UniversalImporter
          onImport={handleImport}
          onClose={() => setShowImporter(false)}
        />
      )}
    </div>
  );
}
