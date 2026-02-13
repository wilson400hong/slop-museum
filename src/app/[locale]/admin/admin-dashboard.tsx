'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { ReportReason } from '@/types';

interface Report {
  id: string;
  reason: ReportReason;
  status: string;
  created_at: string;
  slop: {
    id: string;
    title: string;
    preview_image_url: string | null;
    is_hidden: boolean;
    user_id: string | null;
  };
  reporter: {
    display_name: string;
  };
}

interface Props {
  reports: Report[];
}

export function AdminDashboard({ reports: initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const { toast } = useToast();
  const t = useTranslations('Admin');
  const tReport = useTranslations('Report');
  const locale = useLocale();

  const handleAction = async (
    reportId: string,
    action: 'hide' | 'delete' | 'dismiss' | 'ban',
    userId?: string | null
  ) => {
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, userId }),
      });

      if (!res.ok) throw new Error('Failed');

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast({
        title:
          action === 'hide'
            ? t('workHidden')
            : action === 'delete'
              ? t('workDeleted')
              : action === 'ban'
                ? t('userBanned')
                : t('reportDismissed'),
      });
    } catch {
      toast({ title: t('actionFailed'), variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('pendingReports', { count: reports.length })}</h2>
      </div>

      {reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noReports')}</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {report.slop.title}
                  <Badge variant="destructive">
                    {tReport(report.reason)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('reporter', { name: report.reporter.display_name })} |{' '}
                  {new Date(report.created_at).toLocaleDateString(locale)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(report.id, 'hide')}
                  >
                    {t('hideWork')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(report.id, 'delete')}
                  >
                    {t('deleteWork')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(report.id, 'dismiss')}
                  >
                    {t('dismissReport')}
                  </Button>
                  {report.slop.user_id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(report.id, 'ban', report.slop.user_id)}
                    >
                      {t('banUser')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
