import { Router } from 'express';
import { getUsers, updateUser, deleteUser, getStats } from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Admin only routes
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.get('/stats', authMiddleware, adminMiddleware, getStats);

export default router;