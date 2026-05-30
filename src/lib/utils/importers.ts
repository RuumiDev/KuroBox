import matter from 'gray-matter';
import Papa from 'papaparse';
import { AttributeField, Card } from '@/types';

export interface ImportResult {
  columns: string[];
  schema: AttributeField[];
  cards: Partial<Card>[];
}

export function importFromCSV(content: string): ImportResult {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields ?? [];
  const statusKey =
    headers.find(h => ['status', 'stage', 'column', 'state'].includes(h.toLowerCase())) ??
    headers[0];

  const columns = Array.from(
    new Set(result.data.map(row => row[statusKey]).filter(Boolean))
  ) as string[];

  const schema: AttributeField[] = headers.map(h => ({
    id: h.toLowerCase().replace(/\s+/g, '_'),
    name: h,
    type: 'short_text' as const,
    isEnabled: true,
  }));

  const cards: Partial<Card>[] = result.data.map((row, i) => ({
    status: row[statusKey] || columns[0],
    sort_order: i,
    attributes_data: Object.fromEntries(
      headers.map(h => [h.toLowerCase().replace(/\s+/g, '_'), row[h]])
    ),
  }));

  return { columns, schema, cards };
}

export function importFromMarkdown(content: string): ImportResult {
  // Split on YAML frontmatter boundaries
  const rawBlocks = content.split(/^---\s*$/m).filter(s => s.trim());
  const cards: Partial<Card>[] = [];
  const fieldSet = new Set<string>();

  // Process pairs: each item after a --- is a frontmatter block followed by body
  for (let i = 0; i < rawBlocks.length; i += 2) {
    const frontmatter = rawBlocks[i]?.trim();
    const body = rawBlocks[i + 1]?.trim() ?? '';
    if (!frontmatter) continue;

    try {
      const { data } = matter(`---\n${frontmatter}\n---`);
      Object.keys(data).forEach(k => fieldSet.add(k));
      if (body) fieldSet.add('notes');

      cards.push({
        status: (data.status ?? data.stage ?? 'Backlog') as string,
        sort_order: cards.length,
        attributes_data: { ...data, ...(body ? { notes: body } : {}) },
      });
    } catch {
      // Skip malformed blocks
    }
  }

  const fields = Array.from(fieldSet);
  const columns = Array.from(new Set(cards.map(c => c.status as string).filter(Boolean)));

  const schema: AttributeField[] = fields.map(f => ({
    id: f.toLowerCase().replace(/\s+/g, '_'),
    name: f.charAt(0).toUpperCase() + f.slice(1),
    type: (f === 'notes' ? 'markdown' : 'short_text') as AttributeField['type'],
    isEnabled: true,
  }));

  return { columns, schema, cards };
}
