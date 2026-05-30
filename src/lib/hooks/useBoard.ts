'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Board, BoardConfig, BoardSchema } from '@/types';

export function useBoard(boardId: string, initial?: Board) {
  const [board, setBoard] = useState<Board | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (error) setError(error.message);
    else setBoard(data);
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    if (!initial) fetchBoard();
  }, [fetchBoard, initial]);

  const updateConfig = async (patch: Partial<BoardConfig>) => {
    const next = { ...(board?.config ?? {}), ...patch } as BoardConfig;
    // Optimistic update
    setBoard(prev => prev ? { ...prev, config: next } : prev);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('boards')
      .update({ config: next })
      .eq('id', boardId)
      .select()
      .single();
    if (error) setError(error.message);
    else if (data) setBoard(data);
  };

  const updateSchema = async (schema: BoardSchema) => {
    setBoard(prev => prev ? { ...prev, schema_definition: schema } : prev);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('boards')
      .update({ schema_definition: schema })
      .eq('id', boardId)
      .select()
      .single();
    if (error) setError(error.message);
    else if (data) setBoard(data);
  };

  return { board, loading, error, updateConfig, updateSchema, refetch: fetchBoard };
}
