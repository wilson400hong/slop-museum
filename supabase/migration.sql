-- Slop Museum Database Schema Migration
-- Version: 1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Slops table
CREATE TABLE IF NOT EXISTS slops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('url', 'code')),
  url TEXT,
  code_html TEXT,
  code_css TEXT,
  code_js TEXT,
  sandbox_url TEXT,
  preview_image_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Slop-Tags junction table
CREATE TABLE IF NOT EXISTS slop_tags (
  slop_id UUID NOT NULL REFERENCES slops(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (slop_id, tag_id)
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slop_id UUID NOT NULL REFERENCES slops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hilarious', 'mind_blown', 'cool', 'wtf', 'promising')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slop_id, user_id, type)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slop_id UUID NOT NULL REFERENCES slops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slop_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slop_id UUID NOT NULL REFERENCES slops(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('malicious', 'spam', 'inappropriate')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_slops_user_id ON slops(user_id);
CREATE INDEX IF NOT EXISTS idx_slops_created_at ON slops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slops_type ON slops(type);
CREATE INDEX IF NOT EXISTS idx_reactions_slop_id ON reactions(slop_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Seed default tags
INSERT INTO tags (name) VALUES
  ('game'),
  ('tool'),
  ('art'),
  ('music'),
  ('useless'),
  ('funny')
ON CONFLICT (name) DO NOTHING;

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security Policies

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are publicly readable"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Slops
ALTER TABLE slops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible slops are publicly readable"
  ON slops FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "Admins can read all slops"
  ON slops FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can insert slops"
  ON slops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update their own slops"
  ON slops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any slop"
  ON slops FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete any slop"
  ON slops FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are publicly readable"
  ON tags FOR SELECT
  USING (true);

-- Slop Tags
ALTER TABLE slop_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slop tags are publicly readable"
  ON slop_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert slop tags"
  ON slop_tags FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM slops WHERE id = slop_id AND user_id = auth.uid())
  );

-- Reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are publicly readable"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can read all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage bucket for slop previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('slop-previews', 'slop-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can read preview images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'slop-previews');

CREATE POLICY "Authenticated users can upload preview images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'slop-previews' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own preview images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'slop-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own preview images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'slop-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Sandbox storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('slop-sandboxes', 'slop-sandboxes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read sandbox files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'slop-sandboxes');

CREATE POLICY "Authenticated users can upload sandbox files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'slop-sandboxes' AND auth.role() = 'authenticated');
