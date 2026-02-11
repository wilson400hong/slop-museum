'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Bookmark } from 'lucide-react';

interface Props {
  slopId: string;
}

export function BookmarkButton({ slopId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/slops/${slopId}/bookmark`)
      .then((res) => res.json())
      .then((data) => setBookmarked(data.bookmarked))
      .catch(console.error);
  }, [slopId, user]);

  const toggle = async () => {
    if (!user) {
      toast({ title: '請先登入', variant: 'destructive' });
      return;
    }

    const prev = bookmarked;
    setBookmarked(!bookmarked);
    setLoading(true);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slop_id: slopId }),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      toast({ title: data.action === 'added' ? '已收藏' : '已取消收藏' });
    } catch {
      setBookmarked(prev);
      toast({ title: '操作失敗', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={bookmarked ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
}
