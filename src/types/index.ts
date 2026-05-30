// ============================================================
// KuroBox — Core Type Definitions
// ============================================================

export type AttributeType = 'short_text' | 'markdown' | 'select' | 'date' | 'url' | 'file';

export interface AttributeField {
  id: string;
  name: string;
  type: AttributeType;
  options?: string[];
  isEnabled: boolean;
  required?: boolean;
}

export interface BoardSchema {
  attributes: AttributeField[];
}

export interface BoardConfig {
  view: 'kanban' | 'table';
  visible_attributes: string[];
  column_order: string[];
}

export interface Board {
  id: string;
  user_id: string;
  title: string;
  config: BoardConfig;
  schema_definition: BoardSchema;
  created_at: string;
}

export interface Card {
  id: string;
  board_id: string;
  status: string;
  sort_order: number;
  attributes_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type TemplateId = 'job_tracking' | 'task_board' | 'blank';

export interface BoardTemplate {
  id: TemplateId;
  name: string;
  description: string;
  schema: BoardSchema;
  defaultColumns: string[];
}
