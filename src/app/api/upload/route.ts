import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function compressImage(buffer: Buffer, mimeType: string): Promise<{ data: Buffer; ext: string; contentType: string }> {
  // Skip compression for GIFs to preserve animation
  if (mimeType === 'image/gif') {
    return { data: buffer, ext: 'gif', contentType: 'image/gif' };
  }

  const processed = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  return { data: processed, ext: 'webp', contentType: 'image/webp' };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
      { status: 400 }
    );
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
  }

  if (isMockMode()) {
    const user = mockDb.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    const { data: compressedBuffer, ext: compressedExt } = await compressImage(rawBuffer, file.type);
    const timestamp = Date.now();
    const fileName = `${timestamp}.${compressedExt}`;

    // Save to public/uploads/ for local access
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', user.id);
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, compressedBuffer);

    const url = `/uploads/${user.id}/${fileName}`;
    return NextResponse.json({ url });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Convert File to ArrayBuffer for Node.js compatibility
  const arrayBuffer = await file.arrayBuffer();
  const rawBuffer = Buffer.from(arrayBuffer);
  const { data: compressedBuffer, ext: compressedExt, contentType } = await compressImage(rawBuffer, file.type);
  const fileName = `${user.id}/${Date.now()}.${compressedExt}`;

  const { data, error } = await supabase.storage
    .from('slop-previews')
    .upload(fileName, compressedBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from('slop-previews')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl.publicUrl });
}
