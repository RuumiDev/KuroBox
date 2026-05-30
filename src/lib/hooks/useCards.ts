'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/types';

export function useCards(boardId: string, initial: Card[] = []) {
  const [cards, setCards] = useState<Card[]>(initial);
  const [loading, setLoading] = useState(initial.length === 0);

  const fetchCards = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('sort_order', { ascending: true });

    if (!error && data) setCards(data);
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    if (initial.length === 0) fetchCards();
  }, [fetchCards, initial.length]);

  const createCard = async (status: string, attributes_data: Record<string, unknown> = {}) => {
    const supabase = createClient();
    const sort_order = cards.filter(c => c.status === status).length;
    const { data, error } = await supabase
      .from('cards')
      .insert({ board_id: boardId, status, sort_order, attributes_data })
      .select()
      .single();
    if (!error && data) setCards(prev => [...prev, data]);
    return data as Card | null;
  };

  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    // Optimistic update
    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, ...updates } : c)));
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .select()
      .single();
    if (!error && data) setCards(prev => prev.map(c => (c.id === cardId ? data : c)));
    return data as Card | null;
  };

  const deleteCard = async (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    const supabase = createClient();
    await supabase.from('cards').delete().eq('id', cardId);
  };

  const moveCard = async (cardId: string, newStatus: string, newOrder: number) => {
    // Optimistic reorder
    setCards(prev => {
      const card = prev.find(c => c.id === cardId);
      if (!card) return prev;
      const withoutCard = prev.filter(c => c.id !== cardId);
      const destCards = withoutCard
        .filter(c => c.status === newStatus)
        .sort((a, b) => a.sort_order - b.sort_order);
      destCards.splice(newOrder, 0, { ...card, status: newStatus });
      const reordered = destCards.map((c, i) => ({ ...c, sort_order: i }));
      const others = withoutCard.filter(c => c.status !== newStatus);
      return [...others, ...reordered].sort((a, b) => {
        if (a.status !== b.status) return a.status.localeCompare(b.status);
        return a.sort_order - b.sort_order;
      });
    });
    const supabase = createClient();

    await supabase
      .from('cards')
      .update({ status: newStatus, sort_order: newOrder, updated_at: new Date().toISOString() })
      .eq('id', cardId);
  };

  const bulkInsertCards = async (newCards: Partial<Card>[]) => {
    const supabase = createClient();
    const toInsert = newCards.map(c => ({ ...c, board_id: boardId }));
    const { data } = await supabase.from('cards').insert(toInsert).select();
    if (data) setCards(prev => [...prev, ...data]);
  };

  return { cards, loading, createCard, updateCard, deleteCard, moveCard, bulkInsertCards, refetch: fetchCards };
}
