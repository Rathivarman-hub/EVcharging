import express from 'express';
import multer from 'multer';
import { getUserProfile, updateUserProfile, deleteUser, uploadProfilePicture } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer configuration
const upload = multer({ dest: 'uploads/' });

router.route('/profile')
  .get(authMiddleware, getUserProfile)
  .put(authMiddleware, updateUserProfile);

router.post('/upload-photo', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);

router.delete('/:id', authMiddleware, deleteUser);

export default router;
