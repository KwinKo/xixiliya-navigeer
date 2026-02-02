import { Router } from 'express';
import { exportData, importData } from '../controllers/data.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protected routes
router.get('/export', authMiddleware, exportData);
router.post('/import', authMiddleware, importData);

export default router;