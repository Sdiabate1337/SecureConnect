// models/Professional.js
import mongoose from 'mongoose';

const professionalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ensures one-to-one mapping with User
    },
    profession: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    qualifications: {
      type: [String], // Array of strings for qualifications
      required: true,
    },
    services: {
      type: [String], // Array of services offered by the professional
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE'],
      default: 'AVAILABLE',
    },
  },
  {
    timestamps: true,
  }
);

const Professional = mongoose.model('Professional', professionalSchema);
export default Professional;
