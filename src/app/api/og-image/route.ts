import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SlopMuseum-Bot/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    const html = await res.text();

    // Try og:image in both attribute orders
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (match?.[1]) {
      let imageUrl = match[1];
      // Resolve relative URLs
      if (imageUrl.startsWith('/')) {
        const parsedUrl = new URL(url);
        imageUrl = `${parsedUrl.origin}${imageUrl}`;
      }
      return NextResponse.json({ imageUrl });
    }

    return NextResponse.json({ imageUrl: null });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}
