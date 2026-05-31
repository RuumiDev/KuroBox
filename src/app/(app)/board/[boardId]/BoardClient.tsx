'use client';

import { useState } from 'react';
import { Board, Card } from '@/types';
import { useBoard } from '@/lib/hooks/useBoard';
import { useCards } from '@/lib/hooks/useCards';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TableView from '@/components/table/TableView';
import SchemaManager from '@/components/schema/SchemaManager';
import ColumnReallocationModal from '@/components/schema/ColumnReallocationModal';
import UniversalImporter from '@/components/importer/UniversalImporter';
import CardModal from '@/components/CardModal';
import ViewToggle from '@/components/ViewToggle';
import Button from '@/components/ui/Button';
import FilterToolbar, { ActiveFilter } from '@/components/FilterToolbar';
import { ArrowLeft, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import { ImportResult } from '@/lib/utils/importers';
import ThemeSelector from '@/components/navigation/ThemeSelector';
import KuroBoxLogo from '@/components/navigation/KuroBoxLogo';

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
  const [deletingColumn, setDeletingColumn] = useState<string | null>(null);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [filterText, setFilterText] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const filteredCards = cards.filter(card => {
    // Text search: scan title field and all string attribute values
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      const allText = Object.values(card.attributes_data)
        .filter(v => typeof v === 'string')
        .join(' ')
        .toLowerCase();
      if (!allText.includes(q)) return false;
    }
    // Tag filters: every active filter must match (AND logic)
    for (const f of activeFilters) {
      const cardVal = card.attributes_data[f.attrId] as string | undefined;
      if (cardVal !== f.value) return false;
    }
    return true;
  });

  // Prefer live hook data, fall back to initial server data
  const currentBoard = board ?? initialBoard;
  const view = currentBoard.config.view;

  const columnOrder =
    currentBoard.config.column_order.length > 0
      ? currentBoard.config.column_order
      : (currentBoard.schema_definition.attributes.find(a => a.id === 'status')?.options ?? []);

  const getFirstColumn = () => columnOrder[0] ?? 'Default';

  const handleImport = async (result: ImportResult) => {
    await updateSchema({ attributes: result.schema });
    await updateConfig({ column_order: result.columns });
    await bulkInsertCards(result.cards);
  };

  // Sync active card state when it gets updated by another operation
  const getActiveCard = () =>
    activeCard ? (cards.find(c => c.id === activeCard.id) ?? activeCard) : null;

  // ── Pipeline column management ─────────────────────────────────────────────

  const handleSaveColumns = async (columns: string[]) => {
    await updateConfig({ column_order: columns });
  };

  const handleRequestDeleteColumn = (col: string) => {
    const hasCards = cards.some(c => c.status === col);
    if (!hasCards) {
      // Empty column — remove immediately
      updateConfig({ column_order: columnOrder.filter(c => c !== col) });
    } else {
      // Non-empty — open reallocation modal
      setDeletingColumn(col);
    }
  };

  const handleMigrateColumn = async (targetCol: string) => {
    if (!deletingColumn) return;
    const affected = cards.filter(c => c.status === deletingColumn);
    const baseOrder = cards.filter(c => c.status === targetCol).length;
    // Batch-migrate all cards to the target column
    await Promise.all(
      affected.map((card, i) => moveCard(card.id, targetCol, baseOrder + i))
    );
    await updateConfig({ column_order: columnOrder.filter(c => c !== deletingColumn) });
    setDeletingColumn(null);
  };

  const handleDestroyColumn = async () => {
    if (!deletingColumn) return;
    const affected = cards.filter(c => c.status === deletingColumn);
    await Promise.all(affected.map(card => deleteCard(card.id)));
    await updateConfig({ column_order: columnOrder.filter(c => c !== deletingColumn) });
    setDeletingColumn(null);
  };

  return (
    <div className="h-screen bg-transparent flex flex-col overflow-hidden">
      {/* ── Top toolbar ─────────────────────────────── */}
      <header className="shrink-0 border-b border-zinc-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-40 bg-[var(--kb-bg)]/95 backdrop-blur-sm">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-sm transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>

        <div className="w-px h-4 bg-zinc-800" />
        <KuroBoxLogo size={32} />

        <h1 className="text-sm font-semibold text-white flex-1 truncate">
          {currentBoard.title}
        </h1>

        {/* Mobile: column tab switcher */}
        <div className="flex sm:hidden overflow-x-auto gap-1">
          {columnOrder.map(col => (
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

      {/* ── Active filter toolbar ─────────────────────────────── */}
      <FilterToolbar
        schema={currentBoard.schema_definition.attributes}
        cards={cards}
        filterText={filterText}
        activeFilters={activeFilters}
        onFilterTextChange={setFilterText}
        onAddFilter={f => setActiveFilters(prev => {
          const exists = prev.some(p => p.attrId === f.attrId && p.value === f.value);
          return exists ? prev : [...prev, f];
        })}
        onRemoveFilter={(attrId, value) =>
          setActiveFilters(prev => prev.filter(f => !(f.attrId === attrId && f.value === value)))
        }
        onClearAll={() => { setFilterText(''); setActiveFilters([]); }}
      />

      {/* ── Board content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden p-4">
        {view === 'kanban' ? (
          <KanbanBoard
            board={currentBoard}
            cards={filteredCards}
            onCardClick={setActiveCard}
            onMoveCard={moveCard}
            onCreateCard={status => createCard(status)}
          />
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <TableView
              board={currentBoard}
              cards={filteredCards}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onAddCard={() => createCard(getFirstColumn())}
              onCardClick={setActiveCard}
            />
          </div>
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
          pipelineColumns={columnOrder}
          onSave={updateSchema}
          onSaveColumns={handleSaveColumns}
          onRequestDeleteColumn={handleRequestDeleteColumn}
          onClose={() => setShowSchema(false)}
        />
      )}

      {deletingColumn && (
        <ColumnReallocationModal
          deletingColumn={deletingColumn}
          remainingColumns={columnOrder.filter(c => c !== deletingColumn)}
          onMigrate={handleMigrateColumn}
          onDestroy={handleDestroyColumn}
          onCancel={() => setDeletingColumn(null)}
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
