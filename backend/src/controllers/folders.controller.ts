import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Folder } from '../models/Folder';
import { File } from '../models/File';
import { AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';

export async function listFolders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { parentId } = req.query as { parentId?: string };
    const filter: any = { userId: req.user!._id };
    if (parentId === 'root' || !parentId) filter.parentId = null;
    else filter.parentId = new Types.ObjectId(parentId);

    const folders = await Folder.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: { folders } });
  } catch (err) { next(err); }
}

export async function createFolder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, parentId } = req.body;

    if (parentId) {
      const parent = await Folder.findOne({ _id: parentId, userId: req.user!._id });
      if (!parent) { next(createError('Parent folder not found', 404)); return; }
    }

    const existing = await Folder.findOne({ name, userId: req.user!._id, parentId: parentId || null });
    if (existing) { next(createError('A folder with that name already exists here', 409)); return; }

    const folder = await Folder.create({
      name, userId: req.user!._id,
      parentId: parentId ? new Types.ObjectId(parentId) : null,
    });
    res.status(201).json({ success: true, data: { folder } });
  } catch (err) { next(err); }
}

export async function updateFolder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params['id'], userId: req.user!._id },
      { name }, { new: true },
    );
    if (!folder) { next(createError('Folder not found', 404)); return; }
    res.json({ success: true, data: { folder } });
  } catch (err) { next(err); }
}

export async function deleteFolder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const folder = await Folder.findOne({ _id: req.params['id'], userId: req.user!._id });
    if (!folder) { next(createError('Folder not found', 404)); return; }

    // Trash all files in this folder recursively
    await trashFolderContents(folder._id.toString(), req.user!._id.toString());
    await Folder.deleteOne({ _id: folder._id });

    res.json({ success: true, message: 'Folder deleted' });
  } catch (err) { next(err); }
}

async function trashFolderContents(folderId: string, userId: string): Promise<void> {
  await File.updateMany(
    { folderId: new Types.ObjectId(folderId), userId: new Types.ObjectId(userId) },
    { isTrashed: true, trashedAt: new Date() },
  );
  const subFolders = await Folder.find({ parentId: new Types.ObjectId(folderId), userId: new Types.ObjectId(userId) });
  for (const sub of subFolders) {
    await trashFolderContents(sub._id.toString(), userId);
    await Folder.deleteOne({ _id: sub._id });
  }
}

export async function moveFolder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { parentId } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params['id'], userId: req.user!._id },
      { parentId: parentId ? new Types.ObjectId(parentId) : null },
      { new: true },
    );
    if (!folder) { next(createError('Folder not found', 404)); return; }
    res.json({ success: true, data: { folder } });
  } catch (err) { next(err); }
}
