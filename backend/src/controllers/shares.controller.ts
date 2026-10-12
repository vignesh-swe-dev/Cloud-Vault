import { Response, NextFunction, Request } from 'express';
import crypto from 'crypto';
import argon2 from 'argon2';
import { Types } from 'mongoose';
import { Share } from '../models/Share';
import { File } from '../models/File';
import { AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';
import { getStorageProvider } from '../storage/storage.factory';

export async function createShare(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fileId, password, expiresAt, allowDownload } = req.body;

    const file = await File.findOne({ _id: fileId, userId: req.user!._id, isTrashed: false });
    if (!file) { next(createError('File not found', 404)); return; }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const passwordHash = password ? await argon2.hash(password, { type: argon2.argon2id }) : null;

    const share = await Share.create({
      fileId: file._id,
      userId: req.user!._id,
      tokenHash,
      passwordHash,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      allowDownload: allowDownload ?? true,
    });

    const shareUrl = `/shared/${token}`;
    res.status(201).json({ success: true, data: { share: { ...share.toObject(), token, shareUrl } } });
  } catch (err) { next(err); }
}

export async function listShares(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const shares = await Share.find({ userId: req.user!._id })
      .populate('fileId', 'name mimeType size').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { shares } });
  } catch (err) { next(err); }
}

export async function deleteShare(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const share = await Share.findOneAndDelete({ _id: req.params['id'], userId: req.user!._id });
    if (!share) { next(createError('Share not found', 404)); return; }
    res.json({ success: true, message: 'Share revoked' });
  } catch (err) { next(err); }
}

export async function accessSharedFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const share = await Share.findOne({ tokenHash }).populate('fileId');
    if (!share) { next(createError('Share link not found', 404)); return; }
    if (share.expiresAt && share.expiresAt < new Date()) {
      next(createError('Share link has expired', 410)); return;
    }

    // Password check
    if (share.passwordHash) {
      const providedPassword = req.query['password'] as string || req.body?.password;
      if (!providedPassword) {
        res.status(401).json({ success: false, message: 'Password required', requiresPassword: true });
        return;
      }
      const valid = await argon2.verify(share.passwordHash, providedPassword);
      if (!valid) { next(createError('Incorrect password', 401)); return; }
    }

    const file = share.fileId as any;
    await Share.findByIdAndUpdate(share._id, { $inc: { accessCount: 1 } });

    if (req.query['download'] === 'true' && share.allowDownload) {
      const storage = getStorageProvider();
      const stream = await storage.streamObject(file.storageKey);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
      res.setHeader('Content-Type', file.mimeType);
      stream.pipe(res);
      return;
    }

    res.json({
      success: true,
      data: {
        file: { id: file._id, name: file.name, mimeType: file.mimeType, size: file.size, createdAt: file.createdAt },
        allowDownload: share.allowDownload,
        expiresAt: share.expiresAt,
      },
    });
  } catch (err) { next(err); }
}
