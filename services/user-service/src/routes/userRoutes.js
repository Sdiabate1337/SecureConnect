import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  requestPasswordReset,
  resetPassword
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/login', loginUser); // User login
router.post('/register', registerUser); // User registration
router.get('/profile', authMiddleware, getUserProfile); // Get user profile
router.put('/profile', authMiddleware, updateUserProfile); // Update user profile
router.post('/logout', authMiddleware, logoutUser); // Logout user

// Password reset routes
router.post('/password-reset-request', requestPasswordReset); // Request password reset
router.post('/password-reset', resetPassword); // Reset password

export default router;
