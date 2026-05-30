'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Board, BoardTemplate } from '@/types';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/onboarding/TemplateSelector';
import OnboardingStepper from '@/components/onboarding/OnboardingStepper';
import Button from '@/components/ui/Button';
import { Plus, LogOut, LayoutGrid, Clock, Pencil, Check, X } from 'lucide-react';

interface DashboardClientProps {
  initialBoards: Board[];
  userId: string;
  initialUsername: string | null;
}

export default function DashboardClient({ initialBoards, userId, initialUsername }: DashboardClientProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(!!initialUsername);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const router = useRouter();

  const startRename = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(board.id);
    setRenameValue(board.title);
  };

  const commitRename = async (boardId: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, title: trimmed } : b));
    setRenamingId(null);
    const supabase = createClient();
    await supabase.from('boards').update({ title: trimmed }).eq('id', boardId);
  };

  const cancelRename = () => setRenamingId(null);

  const handleCreateBoard = async (template: BoardTemplate, title: string) => {
    const supabase = createClient();
    const statusAttr = template.schema.attributes.find(a => a.id === 'status');
    const columnOrder = statusAttr?.options ?? template.defaultColumns;

    const { data, error } = await supabase
      .from('boards')
      .insert({
        user_id: userId,
        title,
        config: {
          view: 'kanban',
          visible_attributes: template.schema.attributes
            .filter(a => a.isEnabled)
            .map(a => a.id),
          column_order: columnOrder,
        },
        schema_definition: template.schema,
      })
      .select()
      .single();

    if (!error && data) {
      setBoards(prev => [data, ...prev]);
      setShowNewBoard(false);
      router.push(`/board/${data.id}`);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {!onboardingDone && (
        <OnboardingStepper
          userId={userId}
          onComplete={() => setOnboardingDone(true)}
        />
      )}
    <div className="min-h-screen bg-black">
      {/* Topbar */}
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#FFDE4D] rounded-sm" />
          <span className="text-sm font-bold tracking-tight">KuroBox</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold">Boards</h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              {boards.length} workspace{boards.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setShowNewBoard(true)} icon={<Plus size={13} />}>
            New Board
          </Button>
        </div>

        {boards.length === 0 ? (
          /* Empty state */
          <div className="border border-dashed border-zinc-800 rounded-sm p-16 text-center">
            <LayoutGrid size={24} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No boards yet</p>
            <p className="text-xs text-zinc-700 mt-1">Create one to get started</p>
            <Button
              onClick={() => setShowNewBoard(true)}
              icon={<Plus size={13} />}
              className="mt-5"
            >
              Create first board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <div
                key={board.id}
                className="relative text-left bg-zinc-900 border border-zinc-800 p-5 rounded-sm hover:border-zinc-600 hover:bg-zinc-800/60 transition-all group focus-within:border-zinc-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-5 h-5 bg-[#FFDE4D] rounded-sm" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 uppercase tracking-widest">
                      {board.config.view}
                    </span>
                    {renamingId !== board.id && (
                      <button
                        onClick={e => startRename(board, e)}
                        title="Rename workspace"
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-[#FFDE4D] transition-all cursor-pointer"
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {renamingId === board.id ? (
                  <div className="flex items-center gap-1.5 mb-2" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(board.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      className="flex-1 bg-zinc-800 border border-[#FFDE4D] text-white text-sm px-2 py-1 rounded-sm focus:outline-none"
                    />
                    <button onClick={() => commitRename(board.id)} className="text-green-400 hover:text-green-300 cursor-pointer"><Check size={14} /></button>
                    <button onClick={cancelRename} className="text-zinc-600 hover:text-zinc-400 cursor-pointer"><X size={14} /></button>
                  </div>
                ) : (
                  <h2
                    className="text-sm font-semibold text-white mb-2 truncate cursor-pointer"
                    onClick={() => router.push(`/board/${board.id}`)}
                  >
                    {board.title}
                  </h2>
                )}

                <div
                  className="flex items-center gap-1.5 text-[10px] text-zinc-700 cursor-pointer"
                  onClick={() => renamingId !== board.id && router.push(`/board/${board.id}`)}
                >
                  <Clock size={10} />
                  {new Date(board.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewBoard && (
        <TemplateSelector
          onCreate={handleCreateBoard}
          onClose={() => setShowNewBoard(false)}
        />
      )}
    </div>
    </>
  );
}
