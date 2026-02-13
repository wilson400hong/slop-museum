# Slop Museum

Celebrate the Imperfect — 頌揚不完美的創造

一個專門收藏和展示 AI/Vibe Coding 時代「半成品」的數位博物館。

## Prerequisites

- **Node.js >= 20** (required by Next.js 14)
- A [Supabase](https://supabase.com) project

If you use nvm, switch to Node 20:

```bash
nvm install 20
nvm use 20
```

To set Node 20 as your default:

```bash
nvm alias default 20
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values (found in Supabase → Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set up the database

Go to your Supabase project → **SQL Editor**, paste the contents of `supabase/migration.sql`, and run it. This creates all tables, indexes, RLS policies, triggers, and seed data.

### 4. Initialize Storage buckets

Start the dev server first (see step 6), then open the following URL in your browser:

```
http://localhost:3000/api/setup
```

This automatically creates the required Storage buckets (`slop-previews` and `slop-sandboxes`). You should see:

```json
{"message":"Storage setup complete","results":{"slop-previews":"created","slop-sandboxes":"created"}}
```

> **Note:** This step requires `SUPABASE_SERVICE_ROLE_KEY` to be set in `.env.local`.

### 5. Enable OAuth providers

In your Supabase dashboard → **Authentication** → **Providers**:

- Enable **Google** and add your Google Cloud Console OAuth credentials
- Enable **GitHub** and add your GitHub OAuth App credentials
- Under **URL Configuration**, add `http://localhost:3000/auth/callback` to Redirect URLs

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the 3 environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy
5. Update your Supabase **Site URL** and **Redirect URLs** to match your Vercel production URL

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Deployment | Vercel |
