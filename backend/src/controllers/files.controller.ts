import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { File } from '../models/File';
import { Folder } from '../models/Folder';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';
import { getStorageProvider } from '../storage/storage.factory';
import { getFileCategory, sanitizeFileName, generateStorageKey, isTextEditable } from '../utils/fileUtils';
import { logger } from '../utils/logger';

// ── GET /api/files ──────────────────────────────────────────────────────────
export async function listFiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const { folderId, category, search, sort = 'createdAt', order = 'desc', page = '1', limit = '50', favorites, trashed } = req.query as Record<string, string>;

    const filter: any = { userId };

    if (trashed === 'true') {
      filter.isTrashed = true;
    } else {
      filter.isTrashed = false;
      if (folderId === 'root' || !folderId) filter.folderId = null;
      else if (folderId) filter.folderId = new Types.ObjectId(folderId);
    }

    if (category) filter.category = category;
    if (favorites === 'true') filter.isFavorite = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortDir = order === 'asc' ? 1 : -1;
    const validSorts: Record<string, string> = { name: 'name', size: 'size', createdAt: 'createdAt', type: 'mimeType' };
    const sortField = validSorts[sort] ?? 'createdAt';

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [files, total] = await Promise.all([
      File.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum).lean(),
      File.countDocuments(filter),
    ]);

    res.json({ success: true, data: { files, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
}

// ── POST /api/files/upload ───────────────────────────────────────────────────
export async function uploadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const file = req.file;
    if (!file) { next(createError('No file provided', 400)); return; }

    const user = await User.findById(userId);
    if (!user) { next(createError('User not found', 404)); return; }
    if (user.storageUsed + file.size > user.storageQuota) {
      next(createError('Storage quota exceeded', 413)); return;
    }

    const folderId = req.body.folderId || null;
    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) { next(createError('Folder not found', 404)); return; }
    }

    const safeName = sanitizeFileName(file.originalname);
    const storageKey = generateStorageKey(userId.toString(), safeName);
    const category = getFileCategory(file.mimetype);

    const storage = getStorageProvider();
    await storage.upload({ key: storageKey, buffer: file.buffer, mimeType: file.mimetype, size: file.size });

    const [newFile] = await Promise.all([
      File.create({
        name: safeName, originalName: file.originalname, mimeType: file.mimetype,
        size: file.size, storageKey, category, userId,
        folderId: folderId ? new Types.ObjectId(folderId) : null,
      }),
      User.findByIdAndUpdate(userId, { $inc: { storageUsed: file.size } }),
    ]);

    logger.info('File uploaded', { userId, fileId: newFile._id, size: file.size });
    res.status(201).json({ success: true, data: { file: newFile } });
  } catch (err) { next(err); }
}

// ── GET /api/files/:id ───────────────────────────────────────────────────────
export async function getFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await File.findOne({ _id: req.params['id'], userId: req.user!._id });
    if (!file) { next(createError('File not found', 404)); return; }
    res.json({ success: true, data: { file } });
  } catch (err) { next(err); }
}

// ── GET /api/files/:id/download ─────────────────────────────────────────────
export async function downloadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await File.findOne({ _id: req.params['id'], userId: req.user!._id, isTrashed: false });
    if (!file) { next(createError('File not found', 404)); return; }

    const storage = getStorageProvider();
    const stream = await storage.streamObject(file.storageKey);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    stream.pipe(res);
  } catch (err) { next(err); }
}

// ── PATCH /api/files/:id ─────────────────────────────────────────────────────
export async function updateFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, folderId, isFavorite } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = sanitizeFileName(name);
    if (folderId !== undefined) update.folderId = folderId ? new Types.ObjectId(folderId) : null;
    if (isFavorite !== undefined) update.isFavorite = isFavorite;

    const file = await File.findOneAndUpdate(
      { _id: req.params['id'], userId: req.user!._id },
      update, { new: true },
    );
    if (!file) { next(createError('File not found', 404)); return; }
    res.json({ success: true, data: { file } });
  } catch (err) { next(err); }
}

// ── DELETE /api/files/:id (soft delete) ──────────────────────────────────────
export async function deleteFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params['id'], userId: req.user!._id, isTrashed: false },
      { isTrashed: true, trashedAt: new Date() }, { new: true },
    );
    if (!file) { next(createError('File not found', 404)); return; }
    res.json({ success: true, message: 'File moved to trash' });
  } catch (err) { next(err); }
}

// ── POST /api/files/:id/restore ──────────────────────────────────────────────
export async function restoreFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params['id'], userId: req.user!._id, isTrashed: true },
      { isTrashed: false, trashedAt: null }, { new: true },
    );
    if (!file) { next(createError('File not found in trash', 404)); return; }
    res.json({ success: true, data: { file } });
  } catch (err) { next(err); }
}

// ── DELETE /api/files/:id/permanent ──────────────────────────────────────────
export async function permanentDeleteFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await File.findOne({ _id: req.params['id'], userId: req.user!._id, isTrashed: true });
    if (!file) { next(createError('File not found in trash', 404)); return; }

    const storage = getStorageProvider();
    await storage.deleteObject(file.storageKey);
    await Promise.all([
      File.deleteOne({ _id: file._id }),
      User.findByIdAndUpdate(req.user!._id, { $inc: { storageUsed: -file.size } }),
    ]);
    res.json({ success: true, message: 'File permanently deleted' });
  } catch (err) { next(err); }
}

// ── POST /api/files/bulk-delete ───────────────────────────────────────────────
export async function bulkDelete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fileIds } = req.body;
    await File.updateMany(
      { _id: { $in: fileIds }, userId: req.user!._id, isTrashed: false },
      { isTrashed: true, trashedAt: new Date() },
    );
    res.json({ success: true, message: 'Files moved to trash' });
  } catch (err) { next(err); }
}

// ── GET /api/files/:id/content ────────────────────────────────────────────────
export async function getFileContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await File.findOne({ _id: req.params['id'], userId: req.user!._id, isTrashed: false });
    if (!file) { next(createError('File not found', 404)); return; }
    if (!isTextEditable(file.mimeType)) { next(createError('File is not text-editable', 400)); return; }
    if (file.size > 5 * 1024 * 1024) { next(createError('File too large to edit (max 5MB)', 413)); return; }

    const storage = getStorageProvider();
    const stream = await storage.streamObject(file.storageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const content = Buffer.concat(chunks).toString('utf-8');

    res.json({ success: true, data: { content, mimeType: file.mimeType, updatedAt: file.updatedAt } });
  } catch (err) { next(err); }
}

// ── PUT /api/files/:id/content ────────────────────────────────────────────────
export async function updateFileContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content, lastModified } = req.body;
    const file = await File.findOne({ _id: req.params['id'], userId: req.user!._id, isTrashed: false });
    if (!file) { next(createError('File not found', 404)); return; }
    if (!isTextEditable(file.mimeType)) { next(createError('File is not text-editable', 400)); return; }

    // Version check — prevent overwriting newer version
    if (lastModified && new Date(lastModified) < file.updatedAt) {
      next(createError('File was modified by another session. Refresh before saving.', 409)); return;
    }

    const buffer = Buffer.from(content, 'utf-8');
    const sizeDiff = buffer.length - file.size;

    const user = await User.findById(req.user!._id);
    if (user && user.storageUsed + sizeDiff > user.storageQuota) {
      next(createError('Storage quota exceeded', 413)); return;
    }

    const storage = getStorageProvider();
    await storage.upload({ key: file.storageKey, buffer, mimeType: file.mimeType, size: buffer.length });

    await Promise.all([
      File.findByIdAndUpdate(file._id, { size: buffer.length }),
      User.findByIdAndUpdate(req.user!._id, { $inc: { storageUsed: sizeDiff } }),
    ]);

    res.json({ success: true, message: 'File saved', data: { size: buffer.length, updatedAt: new Date() } });
  } catch (err) { next(err); }
}
