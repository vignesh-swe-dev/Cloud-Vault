import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  userId: Types.ObjectId;
  parentId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
  },
  { timestamps: true },
);

FolderSchema.index({ userId: 1, parentId: 1 });
FolderSchema.index({ userId: 1, name: 1, parentId: 1 });

export const Folder = mongoose.model<IFolder>('Folder', FolderSchema);
