import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITracker extends Document {
  userId: string;
  entries: any[];
}

const TrackerSchema = new Schema<ITracker>(
  {
    userId: { type: String, required: true, unique: true },
    entries: { type: Schema.Types.Mixed, default: [] },
  },
  {
    collection: 'kuro_trackers',
    timestamps: true,
  }
);

// Guard against Mongoose model re-registration during Next.js hot reload
export const TrackerModel: Model<ITracker> =
  (mongoose.models.KuroTracker as Model<ITracker>) ||
  mongoose.model<ITracker>('KuroTracker', TrackerSchema);
