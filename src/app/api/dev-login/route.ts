import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

const DEV_USER_EMAIL = 'dev@slopmuseum.local';
const DEV_USER_PASSWORD = 'dev-password-123';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // In mock mode, just flip the mock auth state
  if (isMockMode()) {
    mockDb.login();
    return NextResponse.json({
      mock: true,
      user: mockDb.getCurrentUser(),
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is required for dev login' },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Check if dev user exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const devUser = existingUsers?.users?.find((u) => u.email === DEV_USER_EMAIL);

  if (!devUser) {
    // Create dev user with auto-confirm
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: DEV_USER_EMAIL,
      password: DEV_USER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Dev User',
        avatar_url: '',
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    email: DEV_USER_EMAIL,
    password: DEV_USER_PASSWORD,
  });
}
