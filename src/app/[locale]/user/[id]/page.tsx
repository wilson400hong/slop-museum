import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { UserProfile } from './user-profile';
import type { Metadata } from 'next';
import { isMockMode, mockDb } from '@/lib/mock-db';

interface Props {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (isMockMode()) {
    const user = mockDb.getUser(params.id);
    return {
      title: user ? `${user.display_name} - Slop Museum` : 'User - Slop Museum',
    };
  }

  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', params.id)
    .single();

  return {
    title: user ? `${user.display_name} - Slop Museum` : 'User - Slop Museum',
  };
}

export default async function UserPage({ params }: Props) {
  if (isMockMode()) {
    const user = mockDb.getUser(params.id);
    if (!user) {
      notFound();
    }
    const slops = mockDb.getUserSlops(params.id);
    return <UserProfile user={user} slops={slops || []} />;
  }

  const supabase = await createClient();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!user) {
    notFound();
  }

  const { data: slops } = await supabase
    .from('slops')
    .select('*, slop_tags(tag_id, tags(*))')
    .eq('user_id', params.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  return <UserProfile user={user} slops={slops || []} />;
}
