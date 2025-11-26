import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../validators/authSchema';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);

export default router;
