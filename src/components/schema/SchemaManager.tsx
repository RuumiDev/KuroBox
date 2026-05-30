'use client';

import { useState } from 'react';
import { BoardSchema, AttributeField, AttributeType } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';

interface SchemaManagerProps {
  schema: BoardSchema;
  onSave: (schema: BoardSchema) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'markdown', label: 'Long Text / Markdown' },
  { value: 'select', label: 'Select / Tags' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL / Link' },
  { value: 'file', label: 'Attachment' },
];

export default function SchemaManager({ schema, onSave, onClose }: SchemaManagerProps) {
  const [attrs, setAttrs] = useState<AttributeField[]>(schema.attributes);

  const addAttr = () => {
    setAttrs(prev => [
      ...prev,
      {
        id: `field_${Date.now()}`,
        name: 'New Field',
        type: 'short_text',
        isEnabled: true,
      },
    ]);
  };

  const update = (id: string, patch: Partial<AttributeField>) =>
    setAttrs(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));

  const remove = (id: string) =>
    setAttrs(prev => prev.filter(a => a.id !== id));

  const handleSave = () => {
    onSave({ attributes: attrs });
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Schema Manager" size="md">
      <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
        {attrs.map(attr => (
          <div
            key={attr.id}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-3 rounded-sm"
          >
            <GripVertical size={13} className="text-zinc-700 shrink-0" />

            {/* Name */}
            <input
              value={attr.name}
              onChange={e => update(attr.id, { name: e.target.value })}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors"
              placeholder="Field name"
            />

            {/* Type */}
            <select
              value={attr.type}
              onChange={e => update(attr.id, { type: e.target.value as AttributeType })}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-sm focus:outline-none cursor-pointer"
            >
              {TYPE_OPTIONS.map(t => (
                <option key={t.value} value={t.value} className="bg-zinc-900">
                  {t.label}
                </option>
              ))}
            </select>

            {/* Visible toggle */}
            <button
              onClick={() => update(attr.id, { isEnabled: !attr.isEnabled })}
              title={attr.isEnabled ? 'Hide field' : 'Show field'}
              className="text-zinc-500 hover:text-[#FFDE4D] transition-colors cursor-pointer"
            >
              {attr.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>

            {/* Delete (not for required fields) */}
            {!attr.required && (
              <button
                onClick={() => remove(attr.id)}
                title="Remove field"
                className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800">
        <Button variant="ghost" onClick={addAttr} icon={<Plus size={13} />}>
          Add Field
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Schema</Button>
        </div>
      </div>
    </Modal>
  );
}
