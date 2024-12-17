import express from 'express';
import { createProfessional, getAllProfessionals, getProfessionalProfile } from '../controllers/professionalController.js';
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

// Route pour créer un professionnel
router.post('/', createProfessional);

// Route pour obtenir tous les professionnels
router.get('/all' , authMiddleware, getAllProfessionals);

// Route pour obtenir le profil professionnel d'un utilisateur spécifique
router.get('/me' , authMiddleware, getProfessionalProfile);

export default router;
