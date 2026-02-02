import { Router } from 'express';
import { getBookmarks, createBookmark, getBookmarkById, updateBookmark, deleteBookmark, getPublicBookmarks } from '../controllers/bookmark.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/user/:username', getPublicBookmarks);

// Protected routes
router.get('/', authMiddleware, getBookmarks);
router.post('/', authMiddleware, createBookmark);
router.get('/:id', authMiddleware, getBookmarkById);
router.put('/:id', authMiddleware, updateBookmark);
router.delete('/:id', authMiddleware, deleteBookmark);

export default router;