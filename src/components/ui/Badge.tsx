interface BadgeProps {
  label: string;
}

const COLOR_MAP: Record<string, string> = {
  high: 'bg-red-950 text-red-400 border-red-900',
  critical: 'bg-red-950 text-red-300 border-red-800',
  medium: 'bg-amber-950 text-amber-400 border-amber-900',
  low: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  done: 'bg-emerald-950 text-emerald-400 border-emerald-900',
  'in progress': 'bg-blue-950 text-blue-400 border-blue-900',
  review: 'bg-purple-950 text-purple-400 border-purple-900',
  remote: 'bg-indigo-950 text-indigo-400 border-indigo-900',
  hybrid: 'bg-teal-950 text-teal-400 border-teal-900',
  offer: 'bg-emerald-950 text-emerald-400 border-emerald-900',
  rejected: 'bg-red-950 text-red-500 border-red-900',
  bug: 'bg-red-950 text-red-400 border-red-900',
  feature: 'bg-blue-950 text-blue-400 border-blue-900',
};

export default function Badge({ label }: BadgeProps) {
  const colorClass =
    COLOR_MAP[label.toLowerCase()] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-sm border ${colorClass}`}
    >
      {label}
    </span>
  );
}
