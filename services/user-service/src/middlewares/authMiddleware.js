import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token:', token);  // Log the token for debugging
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded:', decoded.id);  // Log the decoded token
      req.user = await User.findById(decoded.id).select('-password');
      console.log("Authenticated User:", req.user);
      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      console.error('Error:', error);  // Log the error
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

