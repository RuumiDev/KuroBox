'use client';

import { useRef, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { BoardSchema, AttributeField, AttributeType } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Plus, Trash2, GripVertical, Eye, EyeOff, X } from 'lucide-react';

interface SchemaManagerProps {
  schema: BoardSchema;
  pipelineColumns: string[];
  onSave: (schema: BoardSchema) => void;
  onSaveColumns: (columns: string[]) => void;
  onRequestDeleteColumn: (col: string) => void;
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

export default function SchemaManager({
  schema,
  pipelineColumns,
  onSave,
  onSaveColumns,
  onRequestDeleteColumn,
  onClose,
}: SchemaManagerProps) {
  const [activeTab, setActiveTab] = useState<'fields' | 'columns'>('fields');
  const [attrs, setAttrs] = useState<AttributeField[]>(schema.attributes);
  const [localColumns, setLocalColumns] = useState<string[]>(pipelineColumns);
  const [newColInput, setNewColInput] = useState('');
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

  const onFieldDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(attrs);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setAttrs(reordered);
  };

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

  const addColumn = () => {
    const col = newColInput.trim();
    if (!col || localColumns.includes(col)) return;
    setLocalColumns(prev => [...prev, col]);
    setNewColInput('');
  };

  const renameColumn = (idx: number, val: string) => {
    setLocalColumns(prev => prev.map((c, i) => (i === idx ? val : c)));
  };

  const requestDelete = (col: string) => {
    setLocalColumns(prev => prev.filter(c => c !== col));
    onRequestDeleteColumn(col);
  };

  const handleSave = () => {
    onSave({ attributes: attrs });
    onSaveColumns(localColumns);
    onClose();
  };

  const TabBtn = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={[
        'text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors cursor-pointer',
        activeTab === id
          ? 'bg-[var(--kb-accent)] text-[var(--kb-accent-fg)]'
          : 'text-zinc-500 hover:text-zinc-300',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <Modal onClose={onClose} title="Schema Manager" size="md">
      <div className="flex items-center gap-1 mb-4 pb-3 border-b border-zinc-800">
        <TabBtn id="fields" label="Data Fields" />
        <TabBtn id="columns" label="Pipeline Columns" />
      </div>

      {activeTab === 'fields' && (
        <>
          <p className="text-[10px] text-zinc-600 mb-3 font-mono uppercase tracking-widest">
            Drag to reorder · Position 0 = Kanban card title
          </p>
          <DragDropContext onDragEnd={onFieldDragEnd}>
            <Droppable droppableId="schema-fields">
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin"
                >
                  {attrs.map((attr, index) => (
                    <Draggable key={attr.id} draggableId={attr.id} index={index}>
                      {(drag, snap) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className={[
                            'bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden',
                            snap.isDragging ? 'shadow-[2px_2px_0px_var(--kb-accent)] border-[var(--kb-accent)]/40' : '',
                          ].join(' ')}
                        >
                          <div className="flex items-center gap-2 p-3">
                            <span
                              {...drag.dragHandleProps}
                              className="text-zinc-700 hover:text-zinc-400 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                              title="Drag to reorder"
                            >
                              <GripVertical size={13} />
                            </span>
                            <span className={[
                              'text-[9px] font-mono px-1 py-0.5 rounded-sm shrink-0 border',
                              index === 0
                                ? 'text-[var(--kb-accent)] border-[var(--kb-accent)]/40 bg-[var(--kb-accent)]/5'
                                : 'text-zinc-700 border-zinc-800',
                            ].join(' ')}>
                              {index === 0 ? 'TITLE' : `#${index}`}
                            </span>
                            <input
                              value={attr.name}
                              onChange={e => update(attr.id, { name: e.target.value })}
                              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[var(--kb-accent)] transition-colors"
                              placeholder="Field name"
                            />
                            <select
                              value={attr.type}
                              onChange={e => update(attr.id, { type: e.target.value as AttributeType })}
                              className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-sm focus:outline-none cursor-pointer"
                            >
                              {TYPE_OPTIONS.map(t => (
                                <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => update(attr.id, { isEnabled: !attr.isEnabled })}
                              title={attr.isEnabled ? 'Hide field' : 'Show field'}
                              className="text-zinc-500 hover:text-[var(--kb-accent)] transition-colors cursor-pointer"
                            >
                              {attr.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
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

                          {attr.type === 'select' && (
                            <div className="px-3 pb-3 border-t border-zinc-800 pt-2.5 space-y-2">
                              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Tag Options</p>
                              <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                {(attr.options ?? []).length === 0 && (
                                  <span className="text-[10px] text-zinc-700 italic">No options yet</span>
                                )}
                                {(attr.options ?? []).map(opt => (
                                  <span key={opt} className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded-sm">
                                    {opt}
                                    <button onClick={() => removeOption(attr.id, opt)} className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer ml-0.5">
                                      <X size={9} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  ref={el => { newOptionRefs.current[attr.id] = el; }}
                                  value={newOptionInputs[attr.id] ?? ''}
                                  onChange={e => setNewOptionInputs(p => ({ ...p, [attr.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(attr.id); } }}
                                  placeholder="New option…"
                                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[var(--kb-accent)] transition-colors placeholder:text-zinc-700"
                                />
                                <button onClick={() => addOption(attr.id)} className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-[var(--kb-accent)] hover:text-[var(--kb-accent)] px-2 py-1 rounded-sm transition-colors cursor-pointer">
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}

      {activeTab === 'columns' && (
        <>
          <p className="text-[10px] text-zinc-600 mb-3 font-mono uppercase tracking-widest">
            Pipeline columns · Deleting a non-empty column opens reallocation
          </p>
          <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin">
            {localColumns.map((col, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-sm p-3">
                <span className="text-[10px] font-mono text-zinc-700 w-5 shrink-0">{idx + 1}</span>
                <input
                  value={col}
                  onChange={e => renameColumn(idx, e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[var(--kb-accent)] transition-colors"
                  placeholder="Column name"
                />
                <button onClick={() => requestDelete(col)} title="Delete column" className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              value={newColInput}
              onChange={e => setNewColInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColumn(); } }}
              placeholder="New column name…"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-[var(--kb-accent)] transition-colors placeholder:text-zinc-700"
            />
            <Button variant="ghost" onClick={addColumn} icon={<Plus size={13} />}>Add</Button>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800">
        {activeTab === 'fields'
          ? <Button variant="ghost" onClick={addAttr} icon={<Plus size={13} />}>Add Field</Button>
          : <div />
        }
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
