import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ tags: mockDb.getTags() });
  }

  const supabase = await createClient();
  const { data: tags, error } = await supabase.from('tags').select('*').order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tags });
}
