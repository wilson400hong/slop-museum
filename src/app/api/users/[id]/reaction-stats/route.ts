import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  if (isMockMode()) {
    const stats = mockDb.getUserReactionStats(userId);
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    return NextResponse.json({ stats, total });
  }

  const supabase = await createClient();

  // Get all slop IDs for this user
  const { data: slops } = await supabase
    .from('slops')
    .select('id')
    .eq('user_id', userId)
    .eq('is_hidden', false);

  if (!slops || slops.length === 0) {
    return NextResponse.json({
      stats: { hilarious: 0, mind_blown: 0, cool: 0, wtf: 0, promising: 0 },
      total: 0,
    });
  }

  const slopIds = slops.map((s) => s.id);

  const { data: reactions } = await supabase
    .from('reactions')
    .select('type')
    .in('slop_id', slopIds);

  const stats: Record<string, number> = {
    hilarious: 0,
    mind_blown: 0,
    cool: 0,
    wtf: 0,
    promising: 0,
  };

  (reactions || []).forEach((r) => {
    if (stats[r.type] !== undefined) {
      stats[r.type]++;
    }
  });

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return NextResponse.json({ stats, total });
}
