import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validate';
import { createReportSchema, updateStatusSchema, updateReportSchema } from '../validators/reportSchema';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', reportController.list);
router.get('/summary', reportController.summary);
router.get('/mine', requireAuth, reportController.mine);
router.get('/:id', reportController.getById);
router.post('/', requireAuth, upload.single('photo'), validateBody(createReportSchema), reportController.create);
router.patch('/:id/status', requireAuth, validateBody(updateStatusSchema), reportController.updateStatus);
router.patch('/:id', requireAuth, validateBody(updateReportSchema), reportController.updateDetails);
router.delete('/:id', requireAdmin, reportController.remove);

export default router;
