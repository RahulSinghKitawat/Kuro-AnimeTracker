import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
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

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    handle: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    bio: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    // Separate collection from the unused Express backend's 'users' collection
    collection: 'kuro_users',
  }
);

// Guard against Mongoose model re-registration during Next.js hot reload
export const UserModel: Model<IUser> =
  (mongoose.models.KuroUser as Model<IUser>) ||
  mongoose.model<IUser>('KuroUser', UserSchema);
