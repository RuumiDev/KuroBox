import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: boards }, { data: profile }] = await Promise.all([
    supabase
      .from('boards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single(),
  ]);

  return (
    <DashboardClient
      initialBoards={boards ?? []}
      userId={user.id}
      initialUsername={profile?.username ?? null}
    />
  );
}
