import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validate';
import { createReportSchema, updateStatusSchema } from '../validators/reportSchema';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', reportController.list);
router.get('/summary', reportController.summary);
router.get('/:id', reportController.getById);
router.post('/', upload.single('photo'), validateBody(createReportSchema), reportController.create);
router.patch('/:id/status', validateBody(updateStatusSchema), reportController.updateStatus);
router.delete('/:id', requireAdmin, reportController.remove);

export default router;
