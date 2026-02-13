import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';
import type { ReactionType } from '@/types';

export async function POST(request: NextRequest) {
  const { slop_id, type, is_anonymous } = await request.json();

  if (!slop_id || !type) {
    return NextResponse.json({ error: 'slop_id and type are required' }, { status: 400 });
  }

  const validTypes = ['hilarious', 'mind_blown', 'cool', 'wtf', 'promising'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
  }

  if (isMockMode()) {
    const user = mockDb.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const action = mockDb.toggleReaction(slop_id, user.id, type as ReactionType, is_anonymous);
    return NextResponse.json({ action });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if reaction exists (toggle)
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('slop_id', slop_id)
    .eq('user_id', user.id)
    .eq('type', type)
    .single();

  if (existing) {
    // Remove reaction
    await supabase.from('reactions').delete().eq('id', existing.id);
    return NextResponse.json({ action: 'removed' });
  } else {
    // Add reaction
    const { error } = await supabase.from('reactions').insert({
      slop_id,
      user_id: user.id,
      type,
      is_anonymous: is_anonymous || false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ action: 'added' });
  }
}
