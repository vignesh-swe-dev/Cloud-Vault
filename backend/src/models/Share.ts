import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IShare extends Document {
  _id: Types.ObjectId;
  fileId: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  passwordHash: string | null;
  expiresAt: Date | null;
  allowDownload: boolean;
  accessCount: number;
  createdAt: Date;
}

const ShareSchema = new Schema<IShare>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    allowDownload: { type: Boolean, default: true },
    accessCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ShareSchema.index({ tokenHash: 1 }, { unique: true });
ShareSchema.index({ userId: 1 });
ShareSchema.index({ fileId: 1 });

export const Share = mongoose.model<IShare>('Share', ShareSchema);
