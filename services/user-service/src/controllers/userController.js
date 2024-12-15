import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Get user profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
