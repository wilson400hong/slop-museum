import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-xl text-muted-foreground">找不到你要的頁面</p>
      <Button asChild>
        <Link href="/">回到首頁</Link>
      </Button>
    </div>
  );
}
