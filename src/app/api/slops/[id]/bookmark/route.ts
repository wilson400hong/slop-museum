import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isMockMode()) {
    const user = mockDb.getCurrentUser();
    if (!user) {
      return NextResponse.json({ bookmarked: false });
    }
    return NextResponse.json({ bookmarked: mockDb.isBookmarked(user.id, params.id) });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ bookmarked: false });
  }

  const { data } = await supabase
    .from('bookmarks')
    .select('slop_id')
    .eq('user_id', user.id)
    .eq('slop_id', params.id)
    .single();

  return NextResponse.json({ bookmarked: !!data });
}
