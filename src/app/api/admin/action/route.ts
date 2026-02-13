import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  const { reportId, action, userId } = await request.json();

  if (!reportId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (isMockMode()) {
    const user = mockDb.getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const report = mockDb.getReport(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    switch (action) {
      case 'hide':
        mockDb.hideSlop(report.slop_id);
        mockDb.updateReportStatus(reportId, 'reviewed');
        break;
      case 'delete':
        mockDb.deleteSlop(report.slop_id);
        mockDb.updateReportStatus(reportId, 'reviewed');
        break;
      case 'dismiss':
        mockDb.updateReportStatus(reportId, 'dismissed');
        break;
      case 'ban':
        if (!userId) {
          return NextResponse.json({ error: 'userId required for ban' }, { status: 400 });
        }
        mockDb.banUser(userId);
        mockDb.updateReportStatus(reportId, 'reviewed');
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

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

    case 'ban':
      if (!userId) {
        return NextResponse.json({ error: 'userId required for ban' }, { status: 400 });
      }
      await supabase.from('users').update({ is_banned: true }).eq('id', userId);
      await supabase.from('reports').update({ status: 'reviewed' }).eq('id', reportId);
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
