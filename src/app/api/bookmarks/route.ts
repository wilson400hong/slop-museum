import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  const { slop_id } = await request.json();

  if (!slop_id) {
    return NextResponse.json({ error: 'slop_id is required' }, { status: 400 });
  }

  if (isMockMode()) {
    const user = mockDb.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const action = mockDb.toggleBookmark(user.id, slop_id);
    return NextResponse.json({ action });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if bookmark exists (toggle)
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('slop_id')
    .eq('user_id', user.id)
    .eq('slop_id', slop_id)
    .single();

  if (existing) {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('slop_id', slop_id);
    return NextResponse.json({ action: 'removed' });
  } else {
    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      slop_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ action: 'added' });
  }
}
