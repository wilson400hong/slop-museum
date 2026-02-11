'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SlopCard } from '@/components/slop-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Slop, Tag } from '@/types';

export default function HomePage() {
  const [slops, setSlops] = useState<Slop[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchSlops = useCallback(
    async (cursorParam?: string | null, reset?: boolean) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        if (cursorParam) params.set('cursor', cursorParam);
        if (selectedTag) params.set('tag', selectedTag);
        params.set('limit', '20');

        const res = await fetch(`/api/slops?${params.toString()}`);
        const data = await res.json();

        if (reset) {
          setSlops(data.slops || []);
        } else {
          setSlops((prev) => [...prev, ...(data.slops || [])]);
        }

        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      } catch (error) {
        console.error('Failed to fetch slops:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedTag]
  );

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setTags(data.tags || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchSlops(null, true);
  }, [fetchSlops]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchSlops(cursor);
        }
      },
      { threshold: 0.1 }
    );

    const current = loadMoreRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [cursor, hasMore, loadingMore, loading, fetchSlops]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Slop Museum</h1>
        <p className="text-muted-foreground text-lg">
          Celebrate the Imperfect — 頌揚不完美的創造
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <Badge
          variant={selectedTag === null ? 'default' : 'outline'}
          className="cursor-pointer text-sm px-4 py-1"
          onClick={() => setSelectedTag(null)}
        >
          全部
        </Badge>
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTag === tag.name ? 'default' : 'outline'}
            className="cursor-pointer text-sm px-4 py-1"
            onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className="w-full h-[280px] rounded-lg" />
            </div>
          ))}
        </div>
      ) : slops.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            還沒有任何作品，成為第一個提交者吧！
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {slops.map((slop) => (
            <SlopCard key={slop.id} slop={slop} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4">
        {loadingMore && (
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
