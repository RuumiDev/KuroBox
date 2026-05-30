'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Card, AttributeField } from '@/types';
import Badge from '@/components/ui/Badge';
import { Calendar, Link2 } from 'lucide-react';

interface KanbanCardProps {
  card: Card;
  index: number;
  schema: AttributeField[];
  onClick: () => void;
}

export default function KanbanCard({ card, index, schema, onClick }: KanbanCardProps) {
  const titleAttr = schema.find(a => a.required && a.type === 'short_text');
  const title = titleAttr
    ? (card.attributes_data[titleAttr.id] as string)
    : (card.attributes_data['title'] as string);

  // Show up to 3 visible non-title, non-status fields as metadata chips
  const previewAttrs = schema
    .filter(a => a.isEnabled && !a.required && a.id !== 'status' && a.type !== 'markdown')
    .slice(0, 3);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={[
            'bg-zinc-900 border p-3 rounded-sm cursor-pointer select-none',
            'transition-all duration-150',
            'hover:border-zinc-600 hover:bg-zinc-800',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFDE4D]',
            snapshot.isDragging
              ? 'scale-[1.01] rotate-1 shadow-[3px_3px_0px_#FFDE4D] border-[#FFDE4D]/40 z-50'
              : 'border-zinc-800',
          ].join(' ')}
        >
          <p className="text-sm font-medium text-white leading-snug line-clamp-2">
            {title || 'Untitled'}
          </p>

          {previewAttrs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {previewAttrs.map(attr => {
                const value = card.attributes_data[attr.id];
                if (!value) return null;

                if (attr.type === 'select') {
                  return <Badge key={attr.id} label={value as string} />;
                }
                if (attr.type === 'date') {
                  return (
                    <span
                      key={attr.id}
                      className="flex items-center gap-1 text-[10px] text-zinc-500"
                    >
                      <Calendar size={10} />
                      {value as string}
                    </span>
                  );
                }
                if (attr.type === 'url') {
                  return (
                    <span
                      key={attr.id}
                      className="flex items-center gap-1 text-[10px] text-zinc-500"
                    >
                      <Link2 size={10} /> Link
                    </span>
                  );
                }
                return (
                  <span
                    key={attr.id}
                    className="text-[10px] text-zinc-500 truncate max-w-[120px]"
                  >
                    {value as string}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
