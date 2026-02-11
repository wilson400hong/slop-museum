'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { LoginButton } from '@/components/login-button';
import { UserMenu } from '@/components/user-menu';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">
            🗑️ Slop Museum
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/submit">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  提交作品
                </Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}
