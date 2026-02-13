import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Ensure user profile exists in the users table
      const user = data.user;
      const metadata = user.user_metadata as Record<string, unknown> | null;
      const displayName =
        (typeof metadata?.full_name === 'string' && metadata.full_name.trim()) ||
        (typeof metadata?.name === 'string' && metadata.name.trim()) ||
        user.email?.split('@')[0] ||
        'User';
      const avatarUrl = metadata?.avatar_url ?? null;
      const provider = user.app_metadata?.provider ?? 'unknown';

      await supabase.from('users').upsert(
        {
          id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          provider,
          role: 'user',
          is_banned: false,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
