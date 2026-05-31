'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ColumnReallocationModalProps {
  deletingColumn: string;
  remainingColumns: string[];
  onMigrate: (targetColumn: string) => void;
  onDestroy: () => void;
  onCancel: () => void;
}

const DESTRUCT_PHRASE = 'CONFIRM DESTRUCT';
const COUNTDOWN_SECONDS = 3;

export default function ColumnReallocationModal({
  deletingColumn,
  remainingColumns,
  onMigrate,
  onDestroy,
  onCancel,
}: ColumnReallocationModalProps) {
  const [migrateTarget, setMigrateTarget] = useState(remainingColumns[0] ?? '');

  // ── Destroy countdown ───────────────────────────────────────────────────────
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!countdownActive || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [countdownActive, countdown]);

  const startCountdown = () => {
    setCountdownActive(true);
    setCountdown(COUNTDOWN_SECONDS);
    setConfirmText('');
  };

  const canDestroy = countdownActive && countdown === 0 && confirmText === DESTRUCT_PHRASE;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="fixed inset-0 backdrop-blur-xl bg-black/70" aria-hidden="true" />

      <div
        className="relative z-10 bg-zinc-950 border border-zinc-800 rounded-sm w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Column Has Cards</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              <span className="font-mono text-zinc-300">&quot;{deletingColumn}&quot;</span> contains cards.
              Choose an action below.
            </p>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* ── Option A: Migrate ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Option A — Migrate Cards
            </p>
            <p className="text-xs text-zinc-500 mb-3">
              Move all cards from <span className="font-mono text-zinc-300">&quot;{deletingColumn}&quot;</span> to
              another pipeline column.
            </p>
            <div className="flex items-center gap-2">
              <select
                value={migrateTarget}
                onChange={e => setMigrateTarget(e.target.value)}
                disabled={remainingColumns.length === 0}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-2 rounded-sm focus:outline-none focus:border-[var(--kb-accent)] cursor-pointer disabled:opacity-40"
              >
                {remainingColumns.length === 0
                  ? <option value="">No columns available</option>
                  : remainingColumns.map(col => (
                    <option key={col} value={col} className="bg-zinc-900">{col}</option>
                  ))
                }
              </select>
              <button
                onClick={() => migrateTarget && onMigrate(migrateTarget)}
                disabled={!migrateTarget}
                className="px-3 py-2 text-xs font-semibold bg-[var(--kb-accent)] text-[var(--kb-accent-fg)] rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Migrate
              </button>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] font-mono text-zinc-700">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* ── Option B: Destroy ── */}
          <div className="bg-zinc-900/60 border border-red-900/40 rounded-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 flex items-center gap-1.5">
              <Trash2 size={11} /> Option B — Destruction Purge
            </p>
            <p className="text-xs text-zinc-500 mb-3">
              Permanently deletes <span className="text-red-400 font-semibold">all cards</span> in{' '}
              <span className="font-mono text-zinc-300">&quot;{deletingColumn}&quot;</span>. This cannot be undone.
            </p>

            {!countdownActive ? (
              <button
                onClick={startCountdown}
                className="w-full py-2 text-xs font-semibold border border-red-900/60 text-red-500 rounded-sm hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                Initiate Destruction Sequence
              </button>
            ) : (
              <div className="space-y-2">
                {/* Countdown indicator */}
                <div className={[
                  'text-center py-2 text-sm font-mono font-bold rounded-sm border',
                  countdown > 0
                    ? 'text-amber-400 border-amber-900/40 bg-amber-950/20'
                    : 'text-red-400 border-red-900/40 bg-red-950/20',
                ].join(' ')}>
                  {countdown > 0
                    ? `Hold… ${countdown}`
                    : 'Enter confirmation below'
                  }
                </div>

                {/* Confirm input */}
                {countdown === 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500">
                      Type <span className="font-mono text-red-400">{DESTRUCT_PHRASE}</span> to confirm:
                    </p>
                    <input
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      placeholder={DESTRUCT_PHRASE}
                      className="w-full bg-zinc-800 border border-red-900/60 text-red-300 text-xs px-2 py-2 rounded-sm focus:outline-none focus:border-red-500 font-mono placeholder:text-zinc-700 transition-colors"
                    />
                    <button
                      onClick={onDestroy}
                      disabled={!canDestroy}
                      className="w-full py-2 text-xs font-bold bg-red-900 text-red-100 rounded-sm hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Purge All Cards
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex justify-end">
          <button
            onClick={onCancel}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
