import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SlopDetail } from './slop-detail';
import type { Metadata } from 'next';
import type { Slop } from '@/types';
import { isMockMode, mockDb } from '@/lib/mock-db';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (isMockMode()) {
    const slop = mockDb.getSlop(params.id);
    return {
      title: slop ? `${slop.title} - Slop Museum` : 'Slop Museum',
      description: slop?.description || '',
    };
  }

  const supabase = await createClient();
  const { data: slop } = await supabase
    .from('slops')
    .select('title, description, preview_image_url')
    .eq('id', params.id)
    .single();

  const t = await getTranslations('Metadata');

  return {
    title: slop ? `${slop.title} - ${t('ogTitle')}` : t('ogTitle'),
    description: slop?.description || '',
    openGraph: {
      title: slop?.title || t('ogTitle'),
      description: slop?.description || '',
      images: slop?.preview_image_url ? [slop.preview_image_url] : [],
    },
  };
}

export default async function SlopPage({ params }: Props) {
  if (isMockMode()) {
    const slop = mockDb.getSlop(params.id);
    if (!slop) {
      notFound();
    }
    return <SlopDetail slop={slop as Record<string, unknown> & Slop} />;
  }

  const supabase = await createClient();

  const { data: slop } = await supabase
    .from('slops')
    .select(`
      *,
      user:users!slops_user_id_fkey(id, display_name, avatar_url),
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
