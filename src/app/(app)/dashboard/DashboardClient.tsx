'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Board, BoardTemplate } from '@/types';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/onboarding/TemplateSelector';
import OnboardingStepper from '@/components/onboarding/OnboardingStepper';
import Button from '@/components/ui/Button';
import {
  Plus, LogOut, LayoutGrid, Clock, Pencil, Check, X, Trash2,
  Activity, Database, GitBranch, TrendingUp, ArrowRight, Settings2,
} from 'lucide-react';
import ThemeSelector from '@/components/navigation/ThemeSelector';

interface DashboardClientProps {
  initialBoards: Board[];
  userId: string;
  initialUsername: string | null;
}

interface CardStat {
  board_id: string;
  total: number;
  by_status: Record<string, number>;
}

interface ActivityEntry {
  id: string;
  board_id: string;
  board_title: string;
  card_preview: string;
  status: string;
  updated_at: string;
}

// ── Metric widget ──────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, accent = false,
}: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={[
      'border rounded-sm p-4 flex flex-col gap-1.5',
      accent
        ? 'border-[var(--kb-accent)]/30 bg-[var(--kb-accent)]/5'
        : 'border-[var(--kb-border)] bg-[var(--kb-surface)]',
    ].join(' ')}>
      <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{label}</span>
      <span className={[
        'text-2xl font-bold tracking-tight leading-none',
        accent ? 'text-[var(--kb-accent)]' : 'text-[var(--kb-text)]',
      ].join(' ')}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-zinc-600">{sub}</span>}
    </div>
  );
}

export default function DashboardClient({ initialBoards, userId, initialUsername }: DashboardClientProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(!!initialUsername);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [cardStats, setCardStats] = useState<CardStat[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  // ── Fetch card stats + recent activity ────────────────────────────────────
  useEffect(() => {
    if (boards.length === 0) { setStatsLoading(false); return; }
    const load = async () => {
      const supabase = createClient();
      const boardIds = boards.map(b => b.id);

      const { data: cards } = await supabase
        .from('cards')
        .select('id, board_id, status, attributes_data, updated_at')
        .in('board_id', boardIds)
        .order('updated_at', { ascending: false });

      if (!cards) { setStatsLoading(false); return; }

      // Aggregate stats
      const statsMap: Record<string, CardStat> = {};
      for (const c of cards) {
        if (!statsMap[c.board_id]) statsMap[c.board_id] = { board_id: c.board_id, total: 0, by_status: {} };
        statsMap[c.board_id].total++;
        statsMap[c.board_id].by_status[c.status] = (statsMap[c.board_id].by_status[c.status] ?? 0) + 1;
      }
      setCardStats(Object.values(statsMap));

      // Build activity feed from 15 most recent card updates
      const boardMap = Object.fromEntries(boards.map(b => [b.id, b]));
      const feed: ActivityEntry[] = cards.slice(0, 15).map(c => {
        const board = boardMap[c.board_id];
        // Try to get a meaningful card preview from first string attribute value
        const preview = Object.values(c.attributes_data as Record<string, unknown>)
          .find(v => typeof v === 'string' && (v as string).trim().length > 0) as string | undefined;
        return {
          id: c.id,
          board_id: c.board_id,
          board_title: board?.title ?? 'Unknown Board',
          card_preview: preview ? (preview.slice(0, 32) + (preview.length > 32 ? '…' : '')) : 'Untitled',
          status: c.status,
          updated_at: c.updated_at,
        };
      });
      setActivity(feed);
      setStatsLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boards.length]);

  // ── Computed metrics ──────────────────────────────────────────────────────
  const totalCards = cardStats.reduce((s, x) => s + x.total, 0);
  const activePipelines = boards.filter(b => {
    const stat = cardStats.find(s => s.board_id === b.id);
    return stat && stat.total > 0;
  }).length;

  // Completion ratio = cards in last column vs total (rough heuristic)
  const completionRatio = (() => {
    let done = 0; let all = 0;
    for (const b of boards) {
      const lastCol = b.config.column_order[b.config.column_order.length - 1];
      const stat = cardStats.find(s => s.board_id === b.id);
      if (!stat) continue;
      all += stat.total;
      done += stat.by_status[lastCol] ?? 0;
    }
    return all > 0 ? Math.round((done / all) * 100) : 0;
  })();

  // ── Board CRUD ────────────────────────────────────────────────────────────
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

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this board? This cannot be undone.')) return;
    setBoards(prev => prev.filter(b => b.id !== boardId));
    const supabase = createClient();
    await supabase.from('boards').delete().eq('id', boardId);
  };

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
          visible_attributes: template.schema.attributes.filter(a => a.isEnabled).map(a => a.id),
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

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <>
      {!onboardingDone && (
        <OnboardingStepper userId={userId} onComplete={() => setOnboardingDone(true)} />
      )}

      <div className="min-h-screen bg-[var(--kb-bg)]">
        {/* ── Topbar ── */}
        <header className="border-b border-[var(--kb-border-subtle)] px-6 py-4 flex items-center justify-between sticky top-0 bg-[var(--kb-bg)] z-40">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[var(--kb-accent)] rounded-sm" />
            <span className="text-sm font-bold tracking-tight">KuroBox</span>
            <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest hidden sm:inline">
              Command Center
            </span>
          </div>
          <div className="flex items-center gap-3">
            {initialUsername && (
              <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest hidden md:inline">
                SIGN-OFF: {initialUsername.toUpperCase()}
              </span>
            )}
            <ThemeSelector />
            <button
              onClick={() => router.push('/settings/interface')}
              title="Interface Settings"
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <Settings2 size={13} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          {/* ── Operational Metrics Board ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={13} className="text-[var(--kb-accent)]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Operational Metrics
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="Active Boards"
                value={boards.length}
                sub={`${activePipelines} with data`}
                accent
              />
              <MetricCard
                label="Total Items"
                value={statsLoading ? '—' : totalCards}
                sub="cards across all boards"
              />
              <MetricCard
                label="Active Pipelines"
                value={statsLoading ? '—' : activePipelines}
                sub="boards with live data"
              />
              <MetricCard
                label="Completion Rate"
                value={statsLoading ? '—' : `${completionRatio}%`}
                sub="items in final stage"
              />
            </div>
          </section>

          {/* ── Two-column layout: boards + activity ── */}
          <div className={boards.length === 1
            ? 'flex flex-col items-center'
            : 'grid grid-cols-1 lg:grid-cols-3 gap-6'
          }>

            {/* ── Board list (2/3 width) ── */}
            <section className={boards.length === 1 ? 'w-full max-w-xl' : 'lg:col-span-2'}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-[var(--kb-accent)]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    Workspaces
                  </span>
                  <span className="font-mono text-[9px] text-zinc-700">
                    [{boards.length}]
                  </span>
                </div>
                <Button onClick={() => setShowNewBoard(true)} icon={<Plus size={12} />}>
                  New Board
                </Button>
              </div>

              {boards.length === 0 ? (
                <div className="border border-dashed border-[var(--kb-border)] rounded-sm p-12 text-center">
                  <LayoutGrid size={22} className="text-zinc-800 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No boards yet</p>
                  <Button onClick={() => setShowNewBoard(true)} icon={<Plus size={12} />} className="mt-5">
                    Create first board
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {boards.map(board => {
                    const stat = cardStats.find(s => s.board_id === board.id);
                    const colOrder = board.config.column_order;
                    return (
                      <div
                        key={board.id}
                        className="relative bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-sm hover:border-[var(--kb-border-subtle)] hover:bg-[var(--kb-surface-alt)] transition-all group"
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          {/* Accent bar */}
                          <div className="w-0.5 h-8 bg-[var(--kb-accent)]/40 rounded-full shrink-0" />

                          {/* Title area */}
                          <div className="flex-1 min-w-0">
                            {renamingId === board.id ? (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <input
                                  autoFocus
                                  value={renameValue}
                                  onChange={e => setRenameValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') commitRename(board.id);
                                    if (e.key === 'Escape') cancelRename();
                                  }}
                                  className="flex-1 bg-[var(--kb-surface-alt)] border border-[var(--kb-accent)] text-[var(--kb-text)] text-sm px-2 py-1 rounded-sm focus:outline-none"
                                />
                                <button onClick={() => commitRename(board.id)} className="text-green-400 hover:text-green-300 cursor-pointer"><Check size={13} /></button>
                                <button onClick={cancelRename} className="text-zinc-600 hover:text-zinc-400 cursor-pointer"><X size={13} /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => router.push(`/board/${board.id}`)}
                                className="text-sm font-semibold text-[var(--kb-text)] hover:text-[var(--kb-accent)] transition-colors truncate text-left w-full cursor-pointer"
                              >
                                {board.title}
                              </button>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-wider">
                                {board.config.view}
                              </span>
                              <span className="text-[9px] text-zinc-700 flex items-center gap-1">
                                <Clock size={9} />
                                {new Date(board.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {stat && (
                                <span className="text-[9px] text-zinc-600">
                                  {stat.total} {stat.total === 1 ? 'item' : 'items'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Column pills */}
                          {colOrder.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                              {colOrder.slice(0, 4).map(col => (
                                <span
                                  key={col}
                                  className="font-mono text-[8px] px-1.5 py-0.5 bg-[var(--kb-surface-alt)] border border-[var(--kb-border)] text-zinc-600 rounded-sm"
                                >
                                  {col}
                                </span>
                              ))}
                              {colOrder.length > 4 && (
                                <span className="font-mono text-[8px] text-zinc-700">+{colOrder.length - 4}</span>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={e => startRename(board, e)}
                              title="Rename"
                              className="p-1.5 text-zinc-600 hover:text-[var(--kb-accent)] transition-colors cursor-pointer rounded-sm hover:bg-[var(--kb-surface)]"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={e => handleDeleteBoard(board.id, e)}
                              title="Delete board"
                              className="p-1.5 text-zinc-700 hover:text-red-400 transition-colors cursor-pointer rounded-sm hover:bg-[var(--kb-surface)]"
                            >
                              <Trash2 size={11} />
                            </button>
                            <button
                              onClick={() => router.push(`/board/${board.id}`)}
                              className="p-1.5 text-zinc-600 hover:text-[var(--kb-accent)] transition-colors cursor-pointer rounded-sm hover:bg-[var(--kb-surface)]"
                            >
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Mini pipeline progress bar */}
                        {stat && stat.total > 0 && colOrder.length > 0 && (
                          <div className="flex h-0.5 rounded-b-sm overflow-hidden">
                            {colOrder.map((col, i) => {
                              const count = stat.by_status[col] ?? 0;
                              const pct = (count / stat.total) * 100;
                              const opacity = 0.3 + (i / colOrder.length) * 0.7;
                              return (
                                <div
                                  key={col}
                                  style={{ width: `${pct}%`, backgroundColor: `var(--kb-accent)`, opacity }}
                                  className="transition-all duration-500"
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Activity Log Feed (1/3 width) ── */}
            {boards.length !== 1 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <GitBranch size={13} className="text-[var(--kb-accent)]" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  Activity Log
                </span>
              </div>

              <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-sm overflow-hidden">
                {statsLoading ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-600 italic">Loading…</div>
                ) : activity.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <TrendingUp size={18} className="text-zinc-800 mx-auto mb-2" />
                    <p className="text-xs text-zinc-600 italic">No activity yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--kb-border-subtle)]">
                    {activity.map(entry => (
                      <div
                        key={entry.id}
                        className="px-3 py-2.5 hover:bg-[var(--kb-surface-alt)] transition-colors cursor-pointer group"
                        onClick={() => router.push(`/board/${entry.board_id}`)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-[9px] text-zinc-700 shrink-0 mt-0.5 w-9">
                            {formatTime(entry.updated_at)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-zinc-300 truncate leading-tight group-hover:text-[var(--kb-text)] transition-colors">
                              {entry.card_preview}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[8px] text-zinc-700 truncate max-w-[60px]">
                                {entry.board_title}
                              </span>
                              <span className="text-[8px] text-zinc-700">→</span>
                              <span className="font-mono text-[8px] text-[var(--kb-accent)]/70">
                                {entry.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            )}
          </div>
        </main>
      </div>

      {showNewBoard && (
        <TemplateSelector
          onCreate={handleCreateBoard}
          onClose={() => setShowNewBoard(false)}
        />
      )}
    </>
  );
}
