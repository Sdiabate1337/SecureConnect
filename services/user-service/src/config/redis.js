import Redis from 'ioredis';

// Initialize Redis client
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Use your Redis host here
  port: process.env.REDIS_PORT || 6379,       // Default Redis port
  password: process.env.REDIS_PASSWORD,      // Optional, if Redis is password-protected
});
