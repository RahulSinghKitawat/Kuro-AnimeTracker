/**
 * userStore.ts — MongoDB-backed user persistence layer.
 * All functions are async. Server-side only (Next.js API routes / auth.ts).
 */
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';

export interface UserRecord {
  id: string;
  handle: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  location?: string;
  website?: string;
  bio?: string;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  handle: string;
  name: string;
  email: string;
  avatar: string;
  location?: string;
  website?: string;
  bio?: string;
}

/** Convert a Mongoose lean document to a plain UserRecord. */
function docToRecord(doc: Record<string, unknown> | any): UserRecord {
  return {
    id: doc.id,
    handle: doc.handle,
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    avatar: doc.avatar || '',
    location: doc.location || '',
    website: doc.website || '',
    bio: doc.bio || '',
    createdAt: doc.createdAt,
  };
}

/** Strip the passwordHash before sending to the client. */
export function toSafeUser(user: UserRecord): SafeUser {
  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    location: user.location,
    website: user.website,
    bio: user.bio,
  };
}

/**
 * Look up a user by email address or handle (case-insensitive, strips leading @).
 */
export async function getUserByIdentity(identity: string): Promise<UserRecord | null> {
  await connectDB();
  const clean = identity.trim().toLowerCase().replace(/^@/, '');
  const doc = await UserModel.findOne({
    $or: [{ email: clean }, { handle: clean }],
  }).lean();
  return doc ? docToRecord(doc) : null;
}

/**
 * Look up a user by their internal ID (e.g. usr_1234567890_abc12).
 */
export async function getUserById(id: string): Promise<UserRecord | null> {
  await connectDB();
  const doc = await UserModel.findOne({ id }).lean();
  return doc ? docToRecord(doc) : null;
}

/**
 * Create a new user account. Throws if the handle or email is already taken.
 */
export async function createUser(params: {
  handle: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
}): Promise<UserRecord> {
  await connectDB();

  const cleanHandle = params.handle.trim().toLowerCase().replace(/^@/, '');
  const cleanEmail = params.email.trim().toLowerCase();

  // Check for duplicates before hashing to fail fast
  const existing = await UserModel.findOne({
    $or: [{ email: cleanEmail }, { handle: cleanHandle }],
  }).lean();

  if (existing) {
    if ((existing as unknown as Record<string, unknown>).email === cleanEmail) {
      throw new Error('Email address is already in use.');
    }
    throw new Error('Archivist handle is already registered.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(params.password, salt);

  const newUser = await UserModel.create({
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    handle: cleanHandle,
    name: params.name?.trim() || cleanHandle,
    email: cleanEmail,
    passwordHash,
    avatar: params.avatar || '',
    createdAt: new Date().toISOString(),
  });

  return docToRecord(newUser.toObject());
}

/**
 * Verify a plain-text password against a bcrypt hash.
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Update an existing user account.
 */
export async function updateUser(id: string, params: {
  handle?: string;
  name?: string;
  avatar?: string;
  location?: string;
  website?: string;
  bio?: string;
}): Promise<UserRecord | null> {
  await connectDB();
  
  const updateData: Partial<typeof params> = { ...params };
  if (updateData.handle) {
    updateData.handle = updateData.handle.trim().toLowerCase().replace(/^@/, '');
  }
  
  const updated = await UserModel.findOneAndUpdate(
    { id },
    { $set: updateData },
    { new: true }
  ).lean();
  
  return updated ? docToRecord(updated) : null;
}
