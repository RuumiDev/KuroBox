'use client';

import { useState } from 'react';
import { BoardTemplate } from '@/types';
import { BOARD_TEMPLATES } from '@/lib/utils/templates';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Briefcase, LayoutList, Square } from 'lucide-react';

const ICONS = {
  job_tracking: Briefcase,
  task_board: LayoutList,
  blank: Square,
};

interface TemplateSelectorProps {
  onCreate: (template: BoardTemplate, title: string) => void;
  onClose: () => void;
}

export default function TemplateSelector({ onCreate, onClose }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<BoardTemplate | null>(null);
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (!selected) return;
    onCreate(selected, title.trim() || selected.name);
  };

  return (
    <Modal onClose={onClose} title="New Board" size="md">
      {/* Template cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {BOARD_TEMPLATES.map(template => {
          const Icon = ICONS[template.id];
          const isSelected = selected?.id === template.id;
          return (
            <button
              key={template.id}
              onClick={() => setSelected(template)}
              className={[
                'p-4 border rounded-sm text-left transition-all cursor-pointer',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFDE4D]',
                isSelected
                  ? 'border-[#FFDE4D] bg-[#FFDE4D]/10'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600',
              ].join(' ')}
            >
              <Icon
                size={18}
                className={isSelected ? 'text-[#FFDE4D]' : 'text-zinc-500'}
              />
              <p className="text-sm font-semibold mt-2.5 text-white">{template.name}</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Board name input (shown once template selected) */}
      {selected && (
        <div className="mb-5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
            Board name
          </label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={selected.name}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!selected}>
          Create Board
        </Button>
      </div>
    </Modal>
  );
}
