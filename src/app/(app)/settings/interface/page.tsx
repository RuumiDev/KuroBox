import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InterfaceSettingsClient from './InterfaceSettingsClient';

export const dynamic = 'force-dynamic';

export default async function InterfaceSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <InterfaceSettingsClient />;
}
