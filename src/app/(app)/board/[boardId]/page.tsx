import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BoardClient from './BoardClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;
  const supabase = await createClient();

  const [{ data: board }, { data: cards }] = await Promise.all([
    supabase.from('boards').select('*').eq('id', boardId).single(),
    supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('sort_order', { ascending: true }),
  ]);

  if (!board) notFound();

  return <BoardClient initialBoard={board} initialCards={cards ?? []} />;
}
