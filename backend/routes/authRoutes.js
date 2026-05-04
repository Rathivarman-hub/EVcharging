import express from 'express';
import { registerUser, sendOTP, verifyOTP, loginUser, logoutUser, verifyLoginOTP, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateUserInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateUserInput, registerUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/verify-login', verifyLoginOTP);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', logoutUser);

export default router;
