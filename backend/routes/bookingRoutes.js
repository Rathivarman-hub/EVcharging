import express from 'express';
import { 
  bookSlot, 
  cancelBooking, 
  getUserBookings, 
  getAllBookings, 
  checkSlotAvailability 
} from '../controllers/bookingController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { validateBookingInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(authMiddleware, validateBookingInput, bookSlot)
  .get(authMiddleware, roleMiddleware(['admin']), getAllBookings);

router.get('/my-bookings', authMiddleware, getUserBookings);
router.get('/check-availability', checkSlotAvailability);
router.delete('/:id', authMiddleware, cancelBooking);

export default router;
