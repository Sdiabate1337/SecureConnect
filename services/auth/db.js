import mongoose from 'mongoose';
import fs from 'fs';

const MONGO_URL_PATH = '/run/secrets/MONGO_URL'; // Docker secret path
let mongoUrl;

// Try to read the MongoDB URL from the secret file
try {
  mongoUrl = fs.readFileSync(MONGO_URL_PATH, 'utf8').trim();
} catch (err) {
  console.error('Docker secret file not found, falling back to environment variable');
  mongoUrl = process.env.MONGO_URL || 'mongodb://root:password123@mongo:27017/auth_service_db?authSource=admin'; // Default fallback
}

if (!mongoUrl) {
  console.error('MongoDB connection URL is missing.');
  process.exit(1); // Exit if no connection URL is available
}

// Connect to MongoDB using Mongoose
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Quit the application on error
  }
};
