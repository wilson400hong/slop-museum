'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReactionBar } from '@/components/reaction-bar';
import { BookmarkButton } from '@/components/bookmark-button';
import { ReportModal } from '@/components/report-modal';
import { ExternalLink, Maximize2 } from 'lucide-react';
import type { Slop } from '@/types';

interface Props {
  slop: Record<string, unknown> & Slop;
}

export function SlopDetail({ slop }: Props) {
  const t = useTranslations('SlopDetail');
  const tTags = useTranslations('Tags');
  const locale = useLocale();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const tags = extractTags(slop);
  const author = slop.user as { id: string; display_name: string; avatar_url: string } | null;

  // iframe load timeout for code type
  useEffect(() => {
    if (slop.type !== 'code') return;

    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeError(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [slop.type, iframeLoaded]);

  const sandboxSrc =
    slop.type === 'code' && slop.sandbox_url
      ? slop.sandbox_url
      : slop.type === 'code'
        ? undefined
        : undefined;

  const srcdoc =
    slop.type === 'code' && !slop.sandbox_url
      ? `<!DOCTYPE html><html><head><style>${slop.code_css || ''}</style></head><body>${slop.code_html || ''}<script>${slop.code_js || ''}<\/script></body></html>`
      : undefined;

  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen?.();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">{slop.title}</h1>
        <div className="flex items-center gap-3 mb-3">
          {slop.is_anonymous ? (
            <span className="text-muted-foreground">{t('anonymous')}</span>
          ) : author ? (
            <Link href={`/user/${author.id}`} className="flex items-center gap-2 hover:underline">
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatar_url || undefined} />
                <AvatarFallback>{author.display_name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{author.display_name}</span>
            </Link>
          ) : null}
          <span className="text-muted-foreground text-sm">
            {new Date(slop.created_at).toLocaleDateString(locale)}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag) => (
              <Badge key={tag.name} variant="secondary">
                {tTags.has(tag.name) ? tTags(tag.name) : tag.name}
              </Badge>
            ))}
          </div>
        )}

        {slop.description && (
          <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{slop.description}</p>
        )}
      </div>

      {/* Preview Image */}
      {slop.preview_image_url && slop.type === 'url' && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
          <Image
            src={slop.preview_image_url}
            alt={slop.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* URL type: Open button */}
      {slop.type === 'url' && slop.url && (
        <div className="mb-6">
          <Button asChild size="lg">
            <a href={slop.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('openWork')}
            </a>
          </Button>
        </div>
      )}

      {/* Code type: Sandbox iframe */}
      {slop.type === 'code' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('workPreview')}</p>
            <Button variant="ghost" size="sm" onClick={handleFullscreen}>
              <Maximize2 className="h-4 w-4 mr-1" />
              {t('fullscreen')}
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden bg-white relative">
            {iframeError ? (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                {t('loadError')}
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={sandboxSrc}
                srcDoc={srcdoc}
                className="w-full h-[500px]"
                sandbox="allow-scripts"
                title={slop.title}
                onLoad={() => setIframeLoaded(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Interactions */}
      <div className="flex items-center justify-between border-t pt-4">
        <ReactionBar slopId={slop.id} />
        <div className="flex items-center gap-2">
          <BookmarkButton slopId={slop.id} />
          <ReportModal slopId={slop.id} />
        </div>
      </div>
    </div>
  );
}

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
