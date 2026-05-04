import express from 'express';
import { getUserProfile, updateUserProfile, deleteUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(authMiddleware, getUserProfile)
  .put(authMiddleware, updateUserProfile);

router.delete('/:id', authMiddleware, deleteUser);

export default router;
