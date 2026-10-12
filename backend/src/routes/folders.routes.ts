import { Router } from 'express';
import * as folders from '../controllers/folders.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createFolderSchema, renameFolderSchema, moveFolderSchema } from '../validators/schemas';

const router = Router();
router.use(authenticate);

router.get('/', folders.listFolders);
router.post('/', validate(createFolderSchema), folders.createFolder);
router.patch('/:id', validate(renameFolderSchema), folders.updateFolder);
router.delete('/:id', folders.deleteFolder);
router.post('/:id/move', validate(moveFolderSchema), folders.moveFolder);

export default router;
