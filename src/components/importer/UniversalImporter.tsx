'use client';

import { useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { importFromCSV, importFromMarkdown, ImportResult } from '@/lib/utils/importers';

interface UniversalImporterProps {
  onImport: (result: ImportResult) => Promise<void>;
  onClose: () => void;
}

export default function UniversalImporter({ onImport, onClose }: UniversalImporterProps) {
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    setError('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      try {
        const result = file.name.endsWith('.csv')
          ? importFromCSV(content)
          : importFromMarkdown(content);

        if (result.cards.length === 0) {
          setError('No records found. Check that the file has data rows.');
          return;
        }
        setPreview(result);
      } catch {
        setError('Could not parse the file. Ensure it is a valid .csv or .md with YAML frontmatter.');
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!preview) return;
    setLoading(true);
    await onImport(preview);
    setLoading(false);
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Universal Importer" size="md">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
          dragging ? 'border-[#FFDE4D] bg-[#FFDE4D]/5' : 'border-zinc-700 hover:border-zinc-600'
        }`}
      >
        <Upload size={22} className="text-zinc-500 mx-auto mb-3" />
        <p className="text-sm text-zinc-400 mb-1">
          Drop a{' '}
          <code className="text-[#FFDE4D] text-xs bg-zinc-800 px-1 py-0.5 rounded-sm">.csv</code>
          {' '}or{' '}
          <code className="text-[#FFDE4D] text-xs bg-zinc-800 px-1 py-0.5 rounded-sm">.md</code>
          {' '}file here
        </p>
        <p className="text-xs text-zinc-600 mb-4">
          Markdown files use YAML frontmatter blocks separated by <code>---</code>
        </p>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv,.md"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <span className="text-xs text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-sm hover:border-zinc-500 hover:text-white transition-colors">
            Browse file
          </span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-900 px-3 py-2 rounded-sm">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={14} className="text-[#FFDE4D]" />
            <span className="text-xs font-semibold text-white">{fileName}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-zinc-500 mb-1.5 uppercase tracking-widest text-[10px]">
                Columns
              </p>
              <div className="flex flex-wrap gap-1">
                {preview.columns.map(c => (
                  <span key={c} className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-sm text-[10px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-zinc-500 mb-1.5 uppercase tracking-widest text-[10px]">Fields</p>
              <p className="text-white font-mono text-lg">{preview.schema.length}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1.5 uppercase tracking-widest text-[10px]">Records</p>
              <p className="text-[#FFDE4D] font-mono text-lg">{preview.cards.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-zinc-800">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!preview || loading}>
          {loading ? 'Importing…' : `Import ${preview?.cards.length ?? ''} Records`}
        </Button>
      </div>
    </Modal>
  );
}
