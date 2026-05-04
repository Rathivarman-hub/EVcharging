import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, roleMiddleware(['admin']), getDashboardStats);

export default router;
