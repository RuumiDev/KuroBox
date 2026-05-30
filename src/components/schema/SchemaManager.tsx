'use client';

import { useRef, useState } from 'react';
import { BoardSchema, AttributeField, AttributeType } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Tag, X } from 'lucide-react';

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
  const [expandedOptions, setExpandedOptions] = useState<string | null>(null);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});
  const newOptionRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addAttr = () => {
    setAttrs(prev => [
      ...prev,
      { id: `field_${Date.now()}`, name: 'New Field', type: 'short_text', isEnabled: true },
    ]);
  };

  const update = (id: string, patch: Partial<AttributeField>) =>
    setAttrs(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));

  const remove = (id: string) => setAttrs(prev => prev.filter(a => a.id !== id));

  /* ── Options helpers ── */
  const addOption = (attrId: string) => {
    const raw = (newOptionInputs[attrId] ?? '').trim();
    if (!raw) return;
    const attr = attrs.find(a => a.id === attrId);
    const existing = attr?.options ?? [];
    if (existing.includes(raw)) return;
    update(attrId, { options: [...existing, raw] });
    setNewOptionInputs(p => ({ ...p, [attrId]: '' }));
    newOptionRefs.current[attrId]?.focus();
  };

  const removeOption = (attrId: string, opt: string) => {
    const attr = attrs.find(a => a.id === attrId);
    update(attrId, { options: (attr?.options ?? []).filter(o => o !== opt) });
  };

  const handleSave = () => {
    onSave({ attributes: attrs });
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Schema Manager" size="md">
      <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
        {attrs.map(attr => (
          <div key={attr.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
            {/* ── Main row ── */}
            <div className="flex items-center gap-2 p-3">
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
                onChange={e => {
                  update(attr.id, { type: e.target.value as AttributeType });
                  if (e.target.value === 'select') setExpandedOptions(attr.id);
                }}
                className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-sm focus:outline-none cursor-pointer"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>
                ))}
              </select>

              {/* Options expand toggle (select only) */}
              {attr.type === 'select' && (
                <button
                  onClick={() => setExpandedOptions(expandedOptions === attr.id ? null : attr.id)}
                  title="Edit tag options"
                  className={`transition-colors cursor-pointer ${expandedOptions === attr.id ? 'text-[#FFDE4D]' : 'text-zinc-500 hover:text-[#FFDE4D]'}`}
                >
                  <Tag size={14} />
                </button>
              )}

              {/* Visible toggle */}
              <button
                onClick={() => update(attr.id, { isEnabled: !attr.isEnabled })}
                title={attr.isEnabled ? 'Hide field' : 'Show field'}
                className="text-zinc-500 hover:text-[#FFDE4D] transition-colors cursor-pointer"
              >
                {attr.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              {/* Delete */}
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

            {/* ── Options editor (select fields only) ── */}
            {attr.type === 'select' && expandedOptions === attr.id && (
              <div className="px-3 pb-3 border-t border-zinc-800 pt-2.5 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">
                  Tag Options
                </p>

                {/* Existing options */}
                <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                  {(attr.options ?? []).length === 0 && (
                    <span className="text-[10px] text-zinc-700 italic">No options yet — add one below</span>
                  )}
                  {(attr.options ?? []).map(opt => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded-sm"
                    >
                      {opt}
                      <button
                        onClick={() => removeOption(attr.id, opt)}
                        className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
                      >
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new option */}
                <div className="flex items-center gap-1.5">
                  <input
                    ref={el => { newOptionRefs.current[attr.id] = el; }}
                    value={newOptionInputs[attr.id] ?? ''}
                    onChange={e => setNewOptionInputs(p => ({ ...p, [attr.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(attr.id); } }}
                    placeholder="New option…"
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[#FFDE4D] transition-colors placeholder:text-zinc-700"
                  />
                  <button
                    onClick={() => addOption(attr.id)}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-[#FFDE4D] hover:text-[#FFDE4D] px-2 py-1 rounded-sm transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800">
        <Button variant="ghost" onClick={addAttr} icon={<Plus size={13} />}>Add Field</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Schema</Button>
        </div>
      </div>
    </Modal>
  );
}