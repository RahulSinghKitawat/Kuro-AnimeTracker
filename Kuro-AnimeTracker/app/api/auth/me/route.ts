import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, getUserByIdentity, toSafeUser, updateUser } from '@/lib/userStore';
import { verifySession, COOKIE_NAME } from '@/lib/session';
import { auth } from '@/auth';

export async function GET() {
  // 1. Check our custom JWT session cookie (email/password login)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = verifySession(token);
      if (payload) {
        const user = await getUserById(payload.userId);
        if (user) return NextResponse.json({ user: toSafeUser(user) });
      }
    }
  } catch {}

  // 2. Fallback: check NextAuth session (Google OAuth login)
  try {
    const session = await auth();
    if (session?.user?.email) {
      const user = await getUserByIdentity(session.user.email);
      if (user) return NextResponse.json({ user: toSafeUser(user) });
    }
  } catch {}

  return NextResponse.json({ user: null });
}

export async function PUT(req: NextRequest) {
  try {
    let userId: string | undefined;

    // 1. Check our custom JWT session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = verifySession(token);
      if (payload) userId = payload.userId;
    }

    // 2. Fallback: check NextAuth session
    if (!userId) {
      const session = await auth();
      if (session?.user?.email) {
        const user = await getUserByIdentity(session.user.email);
        if (user) userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { handle, name, avatar, location, website, bio } = body;

    const updatedUser = await updateUser(userId, { handle, name, avatar, location, website, bio });
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: toSafeUser(updatedUser) });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
