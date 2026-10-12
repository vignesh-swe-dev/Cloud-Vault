import { Router } from 'express';
import * as shares from '../controllers/shares.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createShareSchema } from '../validators/schemas';

const router = Router();

// Public share access (no auth required)
router.get('/shared/:token', shares.accessSharedFile);

// Authenticated share management
router.post('/', authenticate, validate(createShareSchema), shares.createShare);
router.get('/', authenticate, shares.listShares);
router.delete('/:id', authenticate, shares.deleteShare);

export default router;
