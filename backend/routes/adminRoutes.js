import express from 'express';
import { getDashboardStats, getRecentBookings } from '../controllers/adminController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware(['admin']), getDashboardStats);
router.get('/bookings', authMiddleware, roleMiddleware(['admin']), getRecentBookings);
router.get('/dashboard', authMiddleware, roleMiddleware(['admin']), getDashboardStats);

export default router;
