import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('slops')
    .select(`
      *,
      user:users(id, display_name, avatar_url),
      slop_tags(tag_id, tags(*))
    `)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  if (tag) {
    const tags = tag.split(',');
    const { data: tagRecords } = await supabase
      .from('tags')
      .select('id')
      .in('name', tags);

    if (tagRecords && tagRecords.length > 0) {
      const tagIds = tagRecords.map((t) => t.id);
      const { data: slopIds } = await supabase
        .from('slop_tags')
        .select('slop_id')
        .in('tag_id', tagIds);

      if (slopIds) {
        query = query.in(
          'id',
          slopIds.map((s) => s.slop_id)
        );
      }
    }
  }

  const { data: slops, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get reaction counts for each slop
  const slopIds = slops?.map((s) => s.id) || [];
  let reactionCounts: Record<string, Record<string, number>> = {};

  if (slopIds.length > 0) {
    const { data: reactions } = await supabase
      .from('reactions')
      .select('slop_id, type')
      .in('slop_id', slopIds);

    if (reactions) {
      reactionCounts = reactions.reduce(
        (acc, r) => {
          if (!acc[r.slop_id]) {
            acc[r.slop_id] = { hilarious: 0, mind_blown: 0, cool: 0, wtf: 0, promising: 0 };
          }
          acc[r.slop_id][r.type]++;
          return acc;
        },
        {} as Record<string, Record<string, number>>
      );
    }
  }

  const enrichedSlops = slops?.map((slop) => ({
    ...slop,
    reactions_count: reactionCounts[slop.id] || {
      hilarious: 0,
      mind_blown: 0,
      cool: 0,
      wtf: 0,
      promising: 0,
    },
  }));

  const nextCursor =
    slops && slops.length === limit ? slops[slops.length - 1].created_at : null;

  return NextResponse.json({ slops: enrichedSlops, nextCursor });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is banned
  const { data: profile } = await supabase
    .from('users')
    .select('is_banned')
    .eq('id', user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: 'Your account has been banned' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, type, url, code_html, code_css, code_js, preview_image_url, is_anonymous, tags } =
    body;

  // Validate
  if (!title || !type) {
    return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
  }

  if (type === 'url' && !url) {
    return NextResponse.json({ error: 'URL is required for URL type' }, { status: 400 });
  }

  if (!tags || tags.length < 1 || tags.length > 3) {
    return NextResponse.json({ error: 'Must select 1-3 tags' }, { status: 400 });
  }

  // Check code size for code type
  if (type === 'code') {
    const codeSize = (code_html?.length || 0) + (code_css?.length || 0) + (code_js?.length || 0);
    if (codeSize > 500 * 1024) {
      return NextResponse.json({ error: 'Code exceeds 500KB limit' }, { status: 400 });
    }
  }

  // Generate sandbox URL for code type
  let sandbox_url = null;
  if (type === 'code') {
    const htmlContent = generateSandboxHtml(code_html || '', code_css || '', code_js || '');
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const fileName = `${user.id}/${Date.now()}.html`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('slop-sandboxes')
      .upload(fileName, blob, { contentType: 'text/html' });

    if (!uploadError && uploadData) {
      const { data: publicUrl } = supabase.storage
        .from('slop-sandboxes')
        .getPublicUrl(fileName);
      sandbox_url = publicUrl.publicUrl;
    }
  }

  // Insert slop
  const { data: slop, error } = await supabase
    .from('slops')
    .insert({
      user_id: user.id,
      title,
      description: description || '',
      type,
      url: type === 'url' ? url : null,
      code_html: type === 'code' ? code_html : null,
      code_css: type === 'code' ? code_css : null,
      code_js: type === 'code' ? code_js : null,
      sandbox_url,
      preview_image_url: preview_image_url || null,
      is_anonymous: is_anonymous || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert tags
  if (slop && tags.length > 0) {
    const { data: tagRecords } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tags);

    if (tagRecords) {
      await supabase.from('slop_tags').insert(
        tagRecords.map((t) => ({
          slop_id: slop.id,
          tag_id: t.id,
        }))
      );
    }
  }

  return NextResponse.json({ slop }, { status: 201 });
}

function generateSandboxHtml(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slop Sandbox</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}<\/script>
</body>
</html>`;
}
