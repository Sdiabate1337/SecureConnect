// server.js
import express, { json } from 'express';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import { connectDB } from './db.js';
config();

const app = express();

// Middleware
app.use(json()); // Pour analyser le JSON dans les requêtes
connectDB(); // Connexion à la base de données

// Routes
app.use('/api/auth', authRoutes);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
