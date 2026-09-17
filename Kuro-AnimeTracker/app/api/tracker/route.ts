import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import { TrackerModel } from '@/lib/models/Tracker';
import { auth } from '@/auth';
import { verifySession, COOKIE_NAME } from '@/lib/session';
import { getUserByIdentity } from '@/lib/userStore';

async function getUserId(): Promise<string | undefined> {
  // 1. Check custom JWT session cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = verifySession(token);
      if (payload) return payload.userId;
    }
  } catch {}

  // 2. Fallback: check NextAuth session
  try {
    const session = await auth();
    if (session?.user?.email) {
      const user = await getUserByIdentity(session.user.email);
      if (user) return user.id;
    }
  } catch {}
  
  return undefined;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const tracker = await TrackerModel.findOne({ userId }).lean();
    
    return NextResponse.json({ entries: tracker?.entries || [] });
  } catch (error) {
    console.error('Failed to fetch tracker:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const entries = body.entries || [];

    await connectDB();
    
    // Upsert the tracker document (create if missing, update if exists)
    await TrackerModel.findOneAndUpdate(
      { userId },
      { userId, entries },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to sync tracker:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
