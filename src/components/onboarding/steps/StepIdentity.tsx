'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';

interface StepIdentityProps {
  username: string;
  onChange: (v: string) => void;
}

const BOOT_LINES = [
  '> INITIALIZING KUROBOX INSTANCE...',
  '> SECURITY MODULE.......... PASSED',
  '> IDENTITY SUBSYSTEM........ LOADED',
  '> AWAITING OPERATOR TAG INPUT.',
];

export default function StepIdentity({ username, onChange }: StepIdentityProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lineIdx >= BOOT_LINES.length) {
      setTypingDone(true);
      setTimeout(() => inputRef.current?.focus(), 80);
      return;
    }

    const target = BOOT_LINES[lineIdx];

    if (charIdx < target.length) {
      const t = setTimeout(
        () => {
          setLines(prev => {
            const next = [...prev];
            next[lineIdx] = target.slice(0, charIdx + 1);
            return next;
          });
          setCharIdx(c => c + 1);
        },
        charIdx === 0 ? 60 : 26,
      );
      return () => clearTimeout(t);
    } else {
      const pause = lineIdx === BOOT_LINES.length - 1 ? 280 : 100;
      const t = setTimeout(() => {
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, pause);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx]);

  return (
    <div className="p-6">
      {/* Module label */}
      <div className="flex items-center gap-2 mb-5">
        <Terminal size={13} className="text-[#FFDE4D]" />
        <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
          identity_matrix.exe
        </span>
      </div>

      {/* Terminal output */}
      <div className="bg-black border border-zinc-800 rounded-sm p-4 mb-5 min-h-[112px] font-mono text-[11px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              i < lines.length - 1 || typingDone ? 'text-green-400' : 'text-[#FFDE4D]'
            }
          >
            {line}
            {i === lineIdx && !typingDone && lineIdx < BOOT_LINES.length && (
              <span className="inline-block w-[5px] h-[11px] bg-[#FFDE4D] ml-[2px] align-middle animate-pulse" />
            )}
          </div>
        ))}

        {typingDone && (
          <div className="text-[#FFDE4D] mt-1">
            {'> INPUT REQUIRED: '}
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>

      {/* Operator tag input */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
          OPERATOR TAG
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-700 select-none">
            //
          </span>
          <input
            ref={inputRef}
            value={username}
            onChange={e => onChange(e.target.value)}
            placeholder="e.g. UNIT-7, akmal.dev, root_user"
            maxLength={32}
            onKeyDown={e => e.key === 'Enter' && username.trim().length >= 2 && undefined}
            className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-sm pl-8 pr-4 py-2.5 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors placeholder:text-zinc-700"
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
            MIN 2 · MAX 32 · YOUR WORKSPACE IDENTIFIER
          </p>
          <span
            className={`font-mono text-[9px] tabular-nums transition-colors ${
              username.length >= 2 ? 'text-green-500' : 'text-zinc-700'
            }`}
          >
            {username.length}/32
          </span>
        </div>
      </div>
    </div>
  );
}
