import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/authSchema';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/register', validateBody(registerSchema), authController.register);
router.get('/me', requireAuth, authController.me);

export default router;
