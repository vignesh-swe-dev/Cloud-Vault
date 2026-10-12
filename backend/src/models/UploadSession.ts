import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUploadSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  storageKey: string;
  uploadId: string;
  fileName: string;
  mimeType: string;
  createdAt: Date;
}

const UploadSessionSchema = new Schema<IUploadSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storageKey: { type: String, required: true },
    uploadId: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true },
);

// Auto-expire stale sessions after 24h
UploadSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const UploadSession = mongoose.model<IUploadSession>('UploadSession', UploadSessionSchema);
