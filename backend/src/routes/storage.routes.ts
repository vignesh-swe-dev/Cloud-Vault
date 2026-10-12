import { Router } from 'express';
import * as storage from '../controllers/storage.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);
router.get('/usage', storage.getStorageUsage);

export default router;
