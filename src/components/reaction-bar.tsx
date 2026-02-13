'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { REACTION_EMOJI } from '@/types';
import type { ReactionType, ReactionCount } from '@/types';

interface Props {
  slopId: string;
}

const REACTION_TYPES: ReactionType[] = ['hilarious', 'mind_blown', 'cool', 'wtf', 'promising'];

export function ReactionBar({ slopId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Reactions');
  const [counts, setCounts] = useState<ReactionCount>({
    hilarious: 0,
    mind_blown: 0,
    cool: 0,
    wtf: 0,
    promising: 0,
  });
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/slops/${slopId}/reactions`)
      .then((res) => res.json())
      .then((data) => {
        setCounts(data.counts);
        setUserReactions(data.userReactions || []);
      })
      .catch(console.error);
  }, [slopId]);

  const toggleReaction = async (type: ReactionType) => {
    if (!user) {
      toast({ title: t('loginRequired'), variant: 'destructive' });
      return;
    }

    if (loading) return;

    // Optimistic update
    const wasActive = userReactions.includes(type);
    const newUserReactions = wasActive
      ? userReactions.filter((r) => r !== type)
      : [...userReactions, type];
    const newCounts = { ...counts };
    newCounts[type] += wasActive ? -1 : 1;

    setUserReactions(newUserReactions);
    setCounts(newCounts);
    setLoading(type);

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slop_id: slopId, type }),
      });

      if (!res.ok) {
        throw new Error('Failed');
      }
    } catch {
      // Rollback
      setUserReactions(wasActive ? [...userReactions] : userReactions.filter((r) => r !== type));
      setCounts(counts);
      toast({ title: t('actionFailed'), variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_TYPES.map((type) => (
        <Button
          key={type}
          variant={userReactions.includes(type) ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleReaction(type)}
          disabled={loading === type}
          title={t(type)}
          className="gap-1"
        >
          <span>{REACTION_EMOJI[type]}</span>
          <span className="text-xs">{counts[type]}</span>
        </Button>
      ))}
    </div>
  );
}
