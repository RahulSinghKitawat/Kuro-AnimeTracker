import { NextResponse } from 'next/server';
import { getUserByIdentity, verifyPassword, toSafeUser } from '@/lib/userStore';
import { signSession, COOKIE_NAME, MAX_AGE } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identity, password } = body;

    if (!identity || !password) {
      return NextResponse.json(
        { error: 'Archivist handle/email and password are required.' },
        { status: 400 }
      );
    }

    const user = await getUserByIdentity(identity);
    if (!user) {
      return NextResponse.json(
        { error: 'Archivist credentials not found in ledger.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid password. Decryption key rejected.' },
        { status: 401 }
      );
    }

    const safeUser = toSafeUser(user);
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Ledger credentials verified.',
    });

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
      { error: error?.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}
