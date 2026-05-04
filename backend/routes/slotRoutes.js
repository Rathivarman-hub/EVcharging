import express from 'express';
import { createSlots, getSlotsByStation, updateSlotAvailability } from '../controllers/slotController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true }); // Merge params to access stationId from parent router

router.route('/')
  .get(getSlotsByStation)
  .post(authMiddleware, roleMiddleware(['admin']), createSlots);

router.put('/:slotId', authMiddleware, roleMiddleware(['admin']), updateSlotAvailability);

export default router;
