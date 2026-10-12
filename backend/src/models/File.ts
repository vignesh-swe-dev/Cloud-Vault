import mongoose, { Document, Schema, Types } from 'mongoose';

export type FileCategory =
  | 'image' | 'video' | 'audio' | 'document' | 'spreadsheet'
  | 'presentation' | 'archive' | 'text' | 'code' | 'other';

export interface IFile extends Document {
  _id: Types.ObjectId;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  category: FileCategory;
  userId: Types.ObjectId;
  folderId: Types.ObjectId | null;
  isTrashed: boolean;
  trashedAt: Date | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageKey: { type: String, required: true, unique: true },
    category: { type: String, required: true, default: 'other' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

FileSchema.index({ userId: 1, folderId: 1, isTrashed: 1 });
FileSchema.index({ userId: 1, isFavorite: 1 });
FileSchema.index({ userId: 1, isTrashed: 1 });
FileSchema.index({ userId: 1, name: 'text' });
FileSchema.index({ storageKey: 1 }, { unique: true });

export const File = mongoose.model<IFile>('File', FileSchema);
