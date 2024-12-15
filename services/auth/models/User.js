import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { hash } = bcrypt;

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'USER',
      enum: ['USER', 'ADMIN'], // Add more roles if needed
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is new/modified
  this.password = await hash(this.password, 10);
  next();
});

// Mongoose Model
const User = mongoose.model('User', userSchema);

// Create a new user
export const createUser = async (email, password) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use. Please choose another one.');
    }

    // Create a new user and save to database
    const user = new User({ email, password });
    await user.save();

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('An unexpected error occurred while creating the user.');
  }
};

// Find a user by email
export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error finding user:', error);
    throw new Error('An unexpected error occurred while finding the user.');
  }
};

// Export default model
export default User;
