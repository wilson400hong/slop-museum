export type ReactionType = 'hilarious' | 'mind_blown' | 'cool' | 'wtf' | 'promising';
export type SlopType = 'url' | 'code';
export type ReportReason = 'malicious' | 'spam' | 'inappropriate';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  display_name: string;
  avatar_url: string | null;
  provider: string;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
}

export interface Slop {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: SlopType;
  url: string | null;
  code_html: string | null;
  code_css: string | null;
  code_js: string | null;
  sandbox_url: string | null;
  preview_image_url: string | null;
  is_anonymous: boolean;
  is_hidden: boolean;
  created_at: string;
  // Joined fields
  user?: User;
  tags?: Tag[];
  reactions_count?: Record<ReactionType, number>;
}

export interface Tag {
  id: number;
  name: string;
}

export interface SlopTag {
  slop_id: string;
  tag_id: number;
}

export interface Reaction {
  id: string;
  slop_id: string;
  user_id: string;
  type: ReactionType;
  is_anonymous: boolean;
  created_at: string;
}

export interface Bookmark {
  user_id: string;
  slop_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  slop_id: string;
  reporter_id: string;
  reason: ReportReason;
  status: ReportStatus;
  created_at: string;
}

export interface ReactionCount {
  hilarious: number;
  mind_blown: number;
  cool: number;
  wtf: number;
  promising: number;
}

export const REACTION_EMOJI: Record<ReactionType, string> = {
  hilarious: '😂',
  mind_blown: '🤯',
  cool: '🔥',
  wtf: '🤔',
  promising: '✨',
};

export const DEFAULT_TAGS = ['game', 'tool', 'art', 'music', 'useless', 'funny'] as const;
