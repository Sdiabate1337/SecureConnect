import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();
const { compare } = bcrypt;
const { sign } = jwt;

// Input validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Validate input data
  const { error } = registerSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = await createUser(email, password);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input data
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Fallback to 1 hour if not set
      }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

// Protected route
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    data: req.user,
  });
});

// Admin-only route
router.get(
  '/admin',
  authenticateToken,
  authorizeRoles('ADMIN'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to the admin dashboard',
    });
  }
);

router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Clear the cookie containing the token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message,
    });
  }
});

export default router;
