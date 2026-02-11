'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { REACTION_EMOJI } from '@/types';
import type { Slop, ReactionType } from '@/types';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slop: Slop & Record<string, any>;
}

export function SlopCard({ slop }: Props) {
  const tags = slop.tags || extractTags(slop);
  const reactions = slop.reactions_count;

  return (
    <Link href={`/slop/${slop.id}`}>
      <Card className="break-inside-avoid overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {slop.preview_image_url && (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={slop.preview_image_url}
              alt={slop.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">{slop.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {slop.is_anonymous ? 'Anonymous' : slop.user?.display_name || 'Unknown'}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={typeof tag === 'string' ? tag : tag.name} variant="secondary" className="text-xs">
                  {typeof tag === 'string' ? tag : tag.name}
                </Badge>
              ))}
            </div>
          )}

          {reactions && (
            <div className="flex gap-2 text-sm text-muted-foreground">
              {(Object.entries(reactions) as [ReactionType, number][])
                .filter(([, count]) => count > 0)
                .map(([type, count]) => (
                  <span key={type}>
                    {REACTION_EMOJI[type]} {count}
                  </span>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Extract tags from nested slop_tags join
function extractTags(slop: Record<string, unknown>): { name: string }[] {
  const slopTags = slop.slop_tags as Array<{ tags: { name: string } | { name: string }[] }> | undefined;
  if (!slopTags) return [];
  return slopTags
    .map((st) => {
      if (Array.isArray(st.tags)) return st.tags[0];
      return st.tags;
    })
    .filter(Boolean);
}
