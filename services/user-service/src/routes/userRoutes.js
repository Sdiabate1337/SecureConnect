import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/profile').get(authMiddleware, getUserProfile).put(authMiddleware, updateUserProfile);

export default router;
