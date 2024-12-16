import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    bio: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: 'https://example.com/default-profile.png',
    },
    role: {
      type: String,
      default: 'USER',
      enum: ['USER', 'PROFESSIONAL', 'ADMIN'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static methods
userSchema.statics.createUser = async function (userData) {
  const { email } = userData;
  const existingUser = await this.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already in use.');
    error.statusCode = 400;
    throw error;
  }
  const user = new this(userData);
  await user.save();
  return user;
};

userSchema.statics.findUserByEmail = async function (email) {
  return await this.findOne({ email }).lean(); // Optimized query
};

const User = mongoose.model('User', userSchema);
export default User;
