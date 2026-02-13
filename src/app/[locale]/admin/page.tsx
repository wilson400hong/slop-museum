import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboard } from './admin-dashboard';
import { isMockMode, mockDb } from '@/lib/mock-db';

export default async function AdminPage() {
  if (isMockMode()) {
    const user = mockDb.getCurrentUser();
    if (!user || user.role !== 'admin') redirect('/');
    const reports = mockDb.getPendingReports();
    return <AdminDashboard reports={reports || []} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      slop:slops(id, title, preview_image_url, is_hidden),
      reporter:users!reports_reporter_id_fkey(display_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return <AdminDashboard reports={reports || []} />;
}
