import { NextResponse } from 'next/server';
import { createUser, toSafeUser } from '@/lib/userStore';
import { signSession, COOKIE_NAME, MAX_AGE } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { handle, email, password, name } = body;

    if (!handle || !email || !password) {
      return NextResponse.json(
        { error: 'Handle, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const user = await createUser({
      handle,
      email,
      password,
      name,
    });

    const safeUser = toSafeUser(user);
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Account initialized successfully.',
    });

    // Set auth cookie
    const token = signSession(user.id);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create archivist account.' },
      { status: 400 }
    );
  }
}
