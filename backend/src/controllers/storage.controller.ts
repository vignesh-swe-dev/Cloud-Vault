import { Response, NextFunction } from 'express';
import { File } from '../models/File';
import { AuthRequest } from '../middleware/authenticate';

export async function getStorageUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;

    const [usageByCategory, totals] = await Promise.all([
      File.aggregate([
        { $match: { userId, isTrashed: false } },
        { $group: { _id: '$category', size: { $sum: '$size' }, count: { $sum: 1 } } },
      ]),
      File.aggregate([
        { $match: { userId, isTrashed: false } },
        { $group: { _id: null, totalSize: { $sum: '$size' }, totalFiles: { $sum: 1 } } },
      ]),
    ]);

    const summary = totals[0] ?? { totalSize: 0, totalFiles: 0 };

    res.json({
      success: true,
      data: {
        storageUsed: req.user!.storageUsed,
        storageQuota: req.user!.storageQuota,
        totalFiles: summary.totalFiles,
        totalSize: summary.totalSize,
        byCategory: usageByCategory.map((c: any) => ({ category: c._id, size: c.size, count: c.count })),
      },
    });
  } catch (err) { next(err); }
}
