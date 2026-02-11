'use client';

import { useState } from 'react';
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
import { REPORT_REASONS } from '@/types';
import type { ReportReason } from '@/types';

interface Props {
  slopId: string;
}

export function ReportModal({ slopId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReport = async (reason: ReportReason) => {
    if (!user) {
      toast({ title: '請先登入', variant: 'destructive' });
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

      toast({ title: '檢舉已送出' });
      setOpen(false);
    } catch {
      toast({ title: '檢舉失敗', variant: 'destructive' });
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
          <DialogTitle>檢舉作品</DialogTitle>
          <DialogDescription>請選擇檢舉原因</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          {(Object.entries(REPORT_REASONS) as [ReportReason, string][]).map(([reason, label]) => (
            <Button
              key={reason}
              variant="outline"
              onClick={() => handleReport(reason)}
              disabled={loading}
              className="justify-start"
            >
              {label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
