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

  const { slop_id, reason } = await request.json();

  if (!slop_id || !reason) {
    return NextResponse.json({ error: 'slop_id and reason are required' }, { status: 400 });
  }

  const validReasons = ['malicious', 'spam', 'inappropriate'];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Invalid report reason' }, { status: 400 });
  }

  const { error } = await supabase.from('reports').insert({
    slop_id,
    reporter_id: user.id,
    reason,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
