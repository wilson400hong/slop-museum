'use client';

import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { LogOut, User, PlusCircle } from 'lucide-react';

export function UserMenu() {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
          <AvatarFallback>{profile.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/user/${profile.id}`} className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            我的頁面
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/submit" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            提交作品
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="flex items-center text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
