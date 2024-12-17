import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // For generating reset token
import nodemailer from 'nodemailer'; // For sending emails
import axios from 'axios';

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    console.log('Request User:', req.user);
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update only fields provided in the request
    const fieldsToUpdate = ['name', 'bio', 'profilePicture'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Enregistrer un utilisateur
export const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, bio, profilePicture, role, 
      profession, experience, qualifications 
    } = req.body;

    // Vérifiez si l'email est déjà utilisé
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use. Please choose another one.',
      });
    }

    let userId = null;

    // Si l'utilisateur a le rôle PROFESSIONAL, validez d'abord le profil professionnel
    if (role === 'PROFESSIONAL') {
      if (!profession || !experience || !qualifications) {
        return res.status(400).json({
          success: false,
          message: 'Profession, experience, and qualifications are required for professionals.',
        });
      }

      // Créer un ID temporaire pour l'utilisateur
      const tempUser = new User({
        name, email, password, bio, profilePicture, role,
      });
      userId = tempUser._id;

      // Envoi des données au service professionnel
      const professionalData = {
        userId,
        profession,
        experience,
        qualifications,
      };

      try {
        await axios.post(
          `${process.env.PROFESSIONAL_SERVICE_URL}/api/professionals`,
          professionalData
        );
      } catch (error) {
        console.error('Error validating professional profile:', error.response?.data || error.message);
        console.log("Professional Service URL:", process.env.PROFESSIONAL_SERVICE_URL);
        return res.status(500).json({
          success: false,
          message: 'Error creating professional profile in the Professional Service.',
        });
      }
    }

    // Enregistrer l'utilisateur après validation réussie
    const user = new User({
      name, email, password, bio, profilePicture, role,
    });

    await user.save();

    // Réponse de succès
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.',
    });
  }
};


// Logout User (client-side action, typically by deleting the token on client)
export const logoutUser = async (req, res) => {
  // If you implement token blacklisting, you'd check the blacklisted token here
  // For now, we simply send a success message.
  res.json({
    success: true,
    message: 'You have been logged out successfully.',
  });
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist.',
      });
    }

    // Create a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpiration = Date.now() + 3600000; // Token expires in 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpiration;

    await user.save();

    // Send reset link via email (Assuming nodemailer is set up)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined; // Clear expiration

    await user.save();

    res.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


