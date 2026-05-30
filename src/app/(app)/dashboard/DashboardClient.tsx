'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Board, BoardTemplate } from '@/types';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/onboarding/TemplateSelector';
import Button from '@/components/ui/Button';
import { Plus, LogOut, LayoutGrid, Clock } from 'lucide-react';

interface DashboardClientProps {
  initialBoards: Board[];
  userId: string;
}

export default function DashboardClient({ initialBoards, userId }: DashboardClientProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const router = useRouter();

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
              <button
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className="text-left bg-zinc-900 border border-zinc-800 p-5 rounded-sm hover:border-zinc-600 hover:bg-zinc-800/60 transition-all group cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFDE4D]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-5 h-5 bg-[#FFDE4D] rounded-sm" />
                  <span className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 uppercase tracking-widest">
                    {board.config.view}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-white mb-2 truncate">{board.title}</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-700">
                  <Clock size={10} />
                  {new Date(board.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </button>
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
  );
}
