import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  icon?: ReactNode;
  type?: 'button' | 'submit';
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  icon,
  type = 'button',
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-sm transition-all cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-kb-accent';

  const variants = {
    primary: 'bg-kb-accent text-kb-accent-fg hover:bg-kb-accent-hover active:scale-[0.98]',
    ghost: 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white bg-transparent',
    danger: 'border border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
