import mongoose, { Document, Schema, Types } from 'mongoose';
import { config } from '../config';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  storageQuota: number;
  storageUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    storageQuota: { type: Number, default: config.quotas.defaultStorageQuota },
    storageUsed: { type: Number, default: 0 },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
