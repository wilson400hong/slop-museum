import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { reportId, action } = await request.json();

  if (!reportId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get report
  const { data: report } = await supabase
    .from('reports')
    .select('slop_id')
    .eq('id', reportId)
    .single();

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  switch (action) {
    case 'hide':
      await supabase.from('slops').update({ is_hidden: true }).eq('id', report.slop_id);
      await supabase.from('reports').update({ status: 'reviewed' }).eq('id', reportId);
      break;

    case 'delete':
      await supabase.from('slops').delete().eq('id', report.slop_id);
      await supabase.from('reports').update({ status: 'reviewed' }).eq('id', reportId);
      break;

    case 'dismiss':
      await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
