'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ children, title, onClose, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Glassmorphism overlay */}
      <div
        className="fixed inset-0 backdrop-blur-xl bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={`relative z-10 bg-zinc-950 border border-zinc-800 rounded-sm w-full ${widths[size]} shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE4D]"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
