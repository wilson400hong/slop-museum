import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SlopDetail } from './slop-detail';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: slop } = await supabase
    .from('slops')
    .select('title, description, preview_image_url')
    .eq('id', params.id)
    .single();

  return {
    title: slop ? `${slop.title} - Slop Museum` : 'Slop Museum',
    description: slop?.description || '',
    openGraph: {
      title: slop?.title || 'Slop Museum',
      description: slop?.description || '',
      images: slop?.preview_image_url ? [slop.preview_image_url] : [],
    },
  };
}

export default async function SlopPage({ params }: Props) {
  const supabase = await createClient();

  const { data: slop } = await supabase
    .from('slops')
    .select(`
      *,
      user:users(id, display_name, avatar_url),
      slop_tags(tag_id, tags(*))
    `)
    .eq('id', params.id)
    .eq('is_hidden', false)
    .single();

  if (!slop) {
    notFound();
  }

  return <SlopDetail slop={slop} />;
}
