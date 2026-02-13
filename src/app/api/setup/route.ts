import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This route initializes storage buckets. Call it once after setting up the project.
// GET /api/setup
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable' },
      { status: 500 }
    );
  }

  // Use service role key to bypass RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const results: Record<string, string> = {};

  // Create slop-previews bucket
  const { error: previewError } = await supabase.storage.createBucket('slop-previews', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  });
  results['slop-previews'] = previewError
    ? previewError.message.includes('already exists')
      ? 'already exists'
      : `error: ${previewError.message}`
    : 'created';

  // Create slop-sandboxes bucket
  const { error: sandboxError } = await supabase.storage.createBucket('slop-sandboxes', {
    public: true,
    allowedMimeTypes: ['text/html'],
    fileSizeLimit: 1 * 1024 * 1024, // 1MB
  });
  results['slop-sandboxes'] = sandboxError
    ? sandboxError.message.includes('already exists')
      ? 'already exists'
      : `error: ${sandboxError.message}`
    : 'created';

  return NextResponse.json({ message: 'Storage setup complete', results });
}
