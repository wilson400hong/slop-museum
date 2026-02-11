'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { REPORT_REASONS } from '@/types';
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

  const handleAction = async (
    reportId: string,
    action: 'hide' | 'delete' | 'dismiss'
  ) => {
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });

      if (!res.ok) throw new Error('Failed');

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast({
        title:
          action === 'hide'
            ? '作品已下架'
            : action === 'delete'
              ? '作品已刪除'
              : '檢舉已駁回',
      });
    } catch {
      toast({ title: '操作失敗', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">管理後台</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">待處理檢舉 ({reports.length})</h2>
      </div>

      {reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">沒有待處理的檢舉</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {report.slop.title}
                  <Badge variant="destructive">
                    {REPORT_REASONS[report.reason]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  檢舉者：{report.reporter.display_name} |{' '}
                  {new Date(report.created_at).toLocaleDateString('zh-TW')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(report.id, 'hide')}
                  >
                    下架作品
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(report.id, 'delete')}
                  >
                    刪除作品
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(report.id, 'dismiss')}
                  >
                    駁回檢舉
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
