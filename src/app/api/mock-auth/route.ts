import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, mockDb } from '@/lib/mock-db';

// GET: check current mock auth state
export async function GET() {
  if (!isMockMode()) {
    return NextResponse.json({ error: 'Not in mock mode' }, { status: 400 });
  }

  const user = mockDb.getCurrentUser();
  return NextResponse.json({ user });
}

// POST: login or logout
export async function POST(request: NextRequest) {
  if (!isMockMode()) {
    return NextResponse.json({ error: 'Not in mock mode' }, { status: 400 });
  }

  const { action } = await request.json();

  if (action === 'login') {
    mockDb.login();
    return NextResponse.json({ user: mockDb.getCurrentUser() });
  }

  if (action === 'logout') {
    mockDb.logout();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
