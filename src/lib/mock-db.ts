import type { Slop, Tag, Reaction, Bookmark, Report, User, ReactionType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';

// File-based mock database for local development
// Data persists across hot-reloads but can be reset by deleting .mock-db.json

export const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

const MOCK_AUTH_FILE = path.join(process.cwd(), '.mock-auth-state');
const MOCK_DB_FILE = path.join(process.cwd(), '.mock-db.json');

const DEV_USER: User = {
  id: DEV_USER_ID,
  display_name: 'Dev User',
  avatar_url: null,
  provider: 'mock',
  role: 'admin',
  is_banned: false,
  created_at: new Date().toISOString(),
};

const SEED_TAGS: Tag[] = [
  { id: 1, name: 'game' },
  { id: 2, name: 'tool' },
  { id: 3, name: 'art' },
  { id: 4, name: 'music' },
  { id: 5, name: 'useless' },
  { id: 6, name: 'funny' },
];

interface MockData {
  slops: Slop[];
  slopTags: { slop_id: string; tag_id: number }[];
  reactions: Reaction[];
  bookmarks: Bookmark[];
  reports: Report[];
  bannedUserIds: string[];
}

function loadData(): MockData {
  try {
    if (existsSync(MOCK_DB_FILE)) {
      const raw = readFileSync(MOCK_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return { slops: [], slopTags: [], reactions: [], bookmarks: [], reports: [], bannedUserIds: [] };
}

function saveData(data: MockData): void {
  writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2));
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

function isMockLoggedIn(): boolean {
  return existsSync(MOCK_AUTH_FILE);
}

export const mockDb = {
  // Auth
  login(): void {
    writeFileSync(MOCK_AUTH_FILE, 'logged-in');
  },

  logout(): void {
    try { unlinkSync(MOCK_AUTH_FILE); } catch {}
  },

  isLoggedIn(): boolean {
    return isMockLoggedIn();
  },

  getCurrentUser(): User | null {
    return isMockLoggedIn() ? DEV_USER : null;
  },

  // Users
  getUser(id: string): User | undefined {
    if (id === DEV_USER_ID) return DEV_USER;
    return undefined;
  },

  // Tags
  getTags(): Tag[] {
    return [...SEED_TAGS].sort((a, b) => a.name.localeCompare(b.name));
  },

  getTagsByNames(names: string[]): Tag[] {
    return SEED_TAGS.filter((t) => names.includes(t.name));
  },

  // Slops
  getSlops(options: {
    limit: number;
    cursor?: string | null;
    tag?: string | null;
  }) {
    const data = loadData();
    let filtered = data.slops.filter((s) => !s.is_hidden);

    if (options.tag) {
      const tagNames = options.tag.split(',');
      const tagIds = SEED_TAGS.filter((t) => tagNames.includes(t.name)).map((t) => t.id);
      const slopIds = data.slopTags
        .filter((st) => tagIds.includes(st.tag_id))
        .map((st) => st.slop_id);
      filtered = filtered.filter((s) => slopIds.includes(s.id));
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (options.cursor) {
      const cursorDate = new Date(options.cursor).getTime();
      filtered = filtered.filter((s) => new Date(s.created_at).getTime() < cursorDate);
    }

    const slops = filtered.slice(0, options.limit);
    const nextCursor =
      slops.length === options.limit ? slops[slops.length - 1].created_at : null;

    const enriched = slops.map((s) => ({
      ...s,
      user: s.is_anonymous ? null : (s.user_id === DEV_USER_ID ? DEV_USER : null),
      tags: data.slopTags
        .filter((st) => st.slop_id === s.id)
        .map((st) => SEED_TAGS.find((t) => t.id === st.tag_id)!)
        .filter(Boolean),
      reactions_count: this.getReactionCounts(s.id),
      slop_tags: data.slopTags
        .filter((st) => st.slop_id === s.id)
        .map((st) => ({
          tag_id: st.tag_id,
          tags: SEED_TAGS.find((t) => t.id === st.tag_id)!,
        }))
        .filter((st) => st.tags),
    }));

    return { slops: enriched, nextCursor };
  },

  getSlop(id: string) {
    const data = loadData();
    const slop = data.slops.find((s) => s.id === id && !s.is_hidden);
    if (!slop) return null;
    return {
      ...slop,
      user: slop.is_anonymous ? null : (slop.user_id === DEV_USER_ID ? DEV_USER : null),
      tags: data.slopTags
        .filter((st) => st.slop_id === slop.id)
        .map((st) => SEED_TAGS.find((t) => t.id === st.tag_id)!)
        .filter(Boolean),
      slop_tags: data.slopTags
        .filter((st) => st.slop_id === slop.id)
        .map((st) => ({
          tag_id: st.tag_id,
          tags: SEED_TAGS.find((t) => t.id === st.tag_id)!,
        }))
        .filter((st) => st.tags),
    };
  },

  createSlop(input: {
    title: string;
    description: string;
    type: 'url' | 'code';
    url?: string;
    code_html?: string;
    code_css?: string;
    code_js?: string;
    sandbox_url?: string;
    preview_image_url?: string;
    is_anonymous: boolean;
    tags: string[];
  }): Slop {
    const data = loadData();

    const slop: Slop = {
      id: uuidv4(),
      user_id: DEV_USER_ID,
      title: input.title,
      description: input.description,
      type: input.type,
      url: input.url || null,
      code_html: input.code_html || null,
      code_css: input.code_css || null,
      code_js: input.code_js || null,
      sandbox_url: input.sandbox_url || null,
      preview_image_url: input.preview_image_url || null,
      is_anonymous: input.is_anonymous,
      is_hidden: false,
      created_at: new Date().toISOString(),
    };

    data.slops.push(slop);

    const tagRecords = SEED_TAGS.filter((t) => input.tags.includes(t.name));
    tagRecords.forEach((t) => {
      data.slopTags.push({ slop_id: slop.id, tag_id: t.id });
    });

    saveData(data);
    return slop;
  },

  getUserSlops(userId: string) {
    const data = loadData();
    return data.slops
      .filter((s) => s.user_id === userId && !s.is_hidden)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((s) => ({
        ...s,
        slop_tags: data.slopTags
          .filter((st) => st.slop_id === s.id)
          .map((st) => ({
            tag_id: st.tag_id,
            tags: SEED_TAGS.find((t) => t.id === st.tag_id)!,
          }))
          .filter((st) => st.tags),
      }));
  },

  getUserReactionStats(userId: string): Record<ReactionType, number> {
    const data = loadData();
    const userSlopIds = data.slops.filter((s) => s.user_id === userId).map((s) => s.id);
    const counts: Record<ReactionType, number> = {
      hilarious: 0,
      mind_blown: 0,
      cool: 0,
      wtf: 0,
      promising: 0,
    };
    data.reactions
      .filter((r) => userSlopIds.includes(r.slop_id))
      .forEach((r) => {
        counts[r.type]++;
      });
    return counts;
  },

  // Reactions
  getReactionCounts(slopId: string): Record<ReactionType, number> {
    const data = loadData();
    const counts: Record<ReactionType, number> = {
      hilarious: 0,
      mind_blown: 0,
      cool: 0,
      wtf: 0,
      promising: 0,
    };
    data.reactions
      .filter((r) => r.slop_id === slopId)
      .forEach((r) => {
        counts[r.type]++;
      });
    return counts;
  },

  getUserReactions(slopId: string, userId: string): string[] {
    const data = loadData();
    return data.reactions
      .filter((r) => r.slop_id === slopId && r.user_id === userId)
      .map((r) => r.type);
  },

  toggleReaction(slopId: string, userId: string, type: ReactionType, isAnonymous?: boolean): 'added' | 'removed' {
    const data = loadData();
    const idx = data.reactions.findIndex(
      (r) => r.slop_id === slopId && r.user_id === userId && r.type === type
    );
    if (idx >= 0) {
      data.reactions.splice(idx, 1);
      saveData(data);
      return 'removed';
    }
    data.reactions.push({
      id: uuidv4(),
      slop_id: slopId,
      user_id: userId,
      type,
      is_anonymous: isAnonymous || false,
      created_at: new Date().toISOString(),
    });
    saveData(data);
    return 'added';
  },

  // Bookmarks
  isBookmarked(userId: string, slopId: string): boolean {
    const data = loadData();
    return data.bookmarks.some((b) => b.user_id === userId && b.slop_id === slopId);
  },

  toggleBookmark(userId: string, slopId: string): 'added' | 'removed' {
    const data = loadData();
    const idx = data.bookmarks.findIndex((b) => b.user_id === userId && b.slop_id === slopId);
    if (idx >= 0) {
      data.bookmarks.splice(idx, 1);
      saveData(data);
      return 'removed';
    }
    data.bookmarks.push({
      user_id: userId,
      slop_id: slopId,
      created_at: new Date().toISOString(),
    });
    saveData(data);
    return 'added';
  },

  getUserBookmarkedSlops(userId: string): Slop[] {
    const data = loadData();
    const slopIds = data.bookmarks.filter((b) => b.user_id === userId).map((b) => b.slop_id);
    return data.slops.filter((s) => slopIds.includes(s.id) && !s.is_hidden);
  },

  // Reports
  createReport(slopId: string, reporterId: string, reason: string): void {
    const data = loadData();
    data.reports.push({
      id: uuidv4(),
      slop_id: slopId,
      reporter_id: reporterId,
      reason: reason as Report['reason'],
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    saveData(data);
  },

  getPendingReports() {
    const data = loadData();
    return data.reports
      .filter((r) => r.status === 'pending')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((r) => {
        const slop = data.slops.find((s) => s.id === r.slop_id);
        return {
          ...r,
          slop: slop
            ? { id: slop.id, title: slop.title, preview_image_url: slop.preview_image_url, is_hidden: slop.is_hidden, user_id: slop.user_id }
            : { id: r.slop_id, title: '(deleted)', preview_image_url: null, is_hidden: true, user_id: null },
          reporter: r.reporter_id === DEV_USER_ID
            ? { display_name: DEV_USER.display_name }
            : { display_name: 'Unknown' },
        };
      });
  },

  getReport(id: string): Report | undefined {
    const data = loadData();
    return data.reports.find((r) => r.id === id);
  },

  updateReportStatus(id: string, status: Report['status']): void {
    const data = loadData();
    const report = data.reports.find((r) => r.id === id);
    if (report) {
      report.status = status;
      saveData(data);
    }
  },

  // Admin
  hideSlop(slopId: string): void {
    const data = loadData();
    const slop = data.slops.find((s) => s.id === slopId);
    if (slop) {
      slop.is_hidden = true;
      saveData(data);
    }
  },

  deleteSlop(slopId: string): void {
    const data = loadData();
    const idx = data.slops.findIndex((s) => s.id === slopId);
    if (idx >= 0) {
      data.slops.splice(idx, 1);
      saveData(data);
    }
  },

  banUser(userId: string): void {
    const data = loadData();
    if (!data.bannedUserIds.includes(userId)) {
      data.bannedUserIds.push(userId);
      saveData(data);
    }
  },

  isUserBanned(userId: string): boolean {
    const data = loadData();
    return (data.bannedUserIds || []).includes(userId);
  },
};
