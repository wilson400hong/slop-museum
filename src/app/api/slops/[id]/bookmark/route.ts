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
