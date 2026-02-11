import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get reaction counts
  const { data: reactions } = await supabase
    .from('reactions')
    .select('type')
    .eq('slop_id', params.id);

  const counts = {
    hilarious: 0,
    mind_blown: 0,
    cool: 0,
    wtf: 0,
    promising: 0,
  };

  reactions?.forEach((r) => {
    if (r.type in counts) {
      counts[r.type as keyof typeof counts]++;
    }
  });

  // Get user's reactions
  let userReactions: string[] = [];
  if (user) {
    const { data: myReactions } = await supabase
      .from('reactions')
      .select('type')
      .eq('slop_id', params.id)
      .eq('user_id', user.id);

    userReactions = myReactions?.map((r) => r.type) || [];
  }

  return NextResponse.json({ counts, userReactions });
}
