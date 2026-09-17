import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kuro_jwt_super_secret_change_me_in_production_2025';
const COOKIE_NAME = 'kuro_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionPayload {
  userId: string;
}

/** Sign a JWT containing the user's ID. */
export function signSession(userId: string): string {
  return jwt.sign({ userId } satisfies SessionPayload, JWT_SECRET, {
    expiresIn: MAX_AGE,
  });
}

/** Verify and decode a session JWT. Returns null if invalid or expired. */
export function verifySession(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, MAX_AGE };
