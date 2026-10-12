import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../validators/schemas';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

const router = Router();

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.post('/register', authLimiter, validate(registerSchema), auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/logout', auth.logout);
router.post('/refresh', auth.refreshTokens);
router.get('/me', authenticate, auth.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), auth.resetPassword);

export default router;
