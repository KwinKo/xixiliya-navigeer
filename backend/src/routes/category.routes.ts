import { Router } from 'express';
import { getCategories, createCategory, deleteCategory, getPublicCategories } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/user/:username', getPublicCategories);

// Protected routes
router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, createCategory);
router.delete('/:id', authMiddleware, deleteCategory);

export default router;