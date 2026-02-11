'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold text-muted-foreground">出錯了</h1>
      <p className="text-muted-foreground">{error.message || '發生了未知的錯誤'}</p>
      <Button onClick={reset}>重試</Button>
    </div>
  );
}
