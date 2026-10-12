import { Router } from 'express';
import multer from 'multer';
import * as files from '../controllers/files.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { renameFileSchema, moveFileSchema, bulkDeleteSchema, fileContentSchema } from '../validators/schemas';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

router.use(authenticate);

router.get('/', files.listFiles);
router.post('/upload', upload.single('file'), files.uploadFile);
router.post('/bulk-delete', validate(bulkDeleteSchema), files.bulkDelete);

router.get('/:id', files.getFile);
router.get('/:id/download', files.downloadFile);
router.patch('/:id', files.updateFile);
router.delete('/:id', files.deleteFile);
router.post('/:id/restore', files.restoreFile);
router.delete('/:id/permanent', files.permanentDeleteFile);

router.get('/:id/content', files.getFileContent);
router.put('/:id/content', validate(fileContentSchema), files.updateFileContent);

export default router;
