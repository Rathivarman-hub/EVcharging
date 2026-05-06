import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateUserInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateUserInput, registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', logoutUser);

export default router;
