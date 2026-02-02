import { Router } from 'express';
import { register, login, refresh, logout, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/refresh', authMiddleware, refresh);
router.post('/logout', authMiddleware, logout);
router.post('/change-password', authMiddleware, changePassword);

export default router;