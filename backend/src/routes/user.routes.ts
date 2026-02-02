import { Router } from 'express';
import { getCurrentUser, updateCurrentUser, getUserByUsername, deleteCurrentUser } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateCurrentUser);
router.delete('/me', authMiddleware, deleteCurrentUser);

// Public routes
router.get('/:username', getUserByUsername);

export default router;