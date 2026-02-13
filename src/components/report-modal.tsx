'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';
import type { ReportReason } from '@/types';

interface Props {
  slopId: string;
}

const REPORT_REASON_KEYS: ReportReason[] = ['malicious', 'spam', 'inappropriate'];

export function ReportModal({ slopId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Report');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReport = async (reason: ReportReason) => {
    if (!user) {
      toast({ title: t('loginRequired'), variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slop_id: slopId, reason }),
      });

      if (!res.ok) throw new Error('Failed');

      toast({ title: t('submitted') });
      setOpen(false);
    } catch {
      toast({ title: t('failed'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          {REPORT_REASON_KEYS.map((reason) => (
            <Button
              key={reason}
              variant="outline"
              onClick={() => handleReport(reason)}
              disabled={loading}
              className="justify-start"
            >
              {t(reason)}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
