'use client';

import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlopCard } from '@/components/slop-card';
import type { User, Slop } from '@/types';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  user: User;
  slops: Slop[];
}

export function UserProfile({ user, slops }: Props) {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === user.id;
  const [bookmarkedSlops, setBookmarkedSlops] = useState<Slop[]>([]);

  useEffect(() => {
    if (isOwner) {
      const fetchBookmarks = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('bookmarks')
          .select('slop_id, slops(*, slop_tags(tag_id, tags(*)))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setBookmarkedSlops(data.map((b: Record<string, unknown>) => b.slops as Slop));
        }
      };
      fetchBookmarks();
    }
  }, [isOwner, user.id]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar_url || undefined} alt={user.display_name} />
          <AvatarFallback className="text-2xl">
            {user.display_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.display_name}</h1>
          <p className="text-muted-foreground text-sm">
            加入時間：{new Date(user.created_at).toLocaleDateString('zh-TW')}
          </p>
          <p className="text-muted-foreground text-sm">
            {slops.length} 個作品
          </p>
        </div>
      </div>

      <Tabs defaultValue="works">
        <TabsList>
          <TabsTrigger value="works">我的作品</TabsTrigger>
          {isOwner && <TabsTrigger value="bookmarks">收藏</TabsTrigger>}
        </TabsList>

        <TabsContent value="works" className="mt-6">
          {slops.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">還沒有作品</p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {slops.map((slop) => (
                <SlopCard key={slop.id} slop={slop} />
              ))}
            </div>
          )}
        </TabsContent>

        {isOwner && (
          <TabsContent value="bookmarks" className="mt-6">
            {bookmarkedSlops.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">還沒有收藏</p>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {bookmarkedSlops.map((slop) => (
                  <SlopCard key={slop.id} slop={slop} />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
