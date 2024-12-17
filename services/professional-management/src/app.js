import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import professionalRoutes from './routes/professionalRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/professionals', professionalRoutes);

// Default route for API health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware (optional, to catch all unhandled routes)
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Global error handler (optional)
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
});

export default app;
