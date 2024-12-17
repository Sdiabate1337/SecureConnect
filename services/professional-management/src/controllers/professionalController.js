// controllers/professionalController.js
import Professional from '../models/professional.js';
import { getUserById } from '../utils/userServiceClient.js';

// Obtenir tous les professionnels avec les infos utilisateur enrichies
export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.find();

    // Récupérer les infos utilisateur pour chaque professionnel
    const enrichedProfessionals = await Promise.all(
      professionals.map(async (professional) => {
        try {
          const userInfo = await getUserById(professional.userId);
          return {
            ...professional.toObject(),
            user: userInfo, // Ajout des informations utilisateur
          };
        } catch (error) {
          console.error(`Failed to fetch user info for professional: ${professional._id}`);
          return professional; // Retourne les données professionnelles même si l'info utilisateur n'est pas disponible
        }
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedProfessionals,
    });
  } catch (error) {
    console.error('Error retrieving professionals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Obtenir un profil professionnel spécifique avec infos utilisateur
export const getProfessionalProfile = async (req, res) => {
  try {
    const professionalProfile = await Professional.findOne({ userId: req.user._id });

    if (!professionalProfile) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found.',
      });
    }

    // Récupérer les informations utilisateur du User Service
    const userInfo = await getUserById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        ...professionalProfile.toObject(),
        user: userInfo, // Enrichir avec les informations utilisateur
      },
    });
  } catch (error) {
    console.error('Error retrieving professional profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Créer un profil professionnel
export const createProfessional = async (req, res) => {
  try {
    const { userId, profession, experience, qualifications } = req.body;

    // Validation des champs requis
    if (!userId || !profession || !experience || !qualifications) {
      return res.status(400).json({
        success: false,
        message: 'userId, profession, experience, and qualifications are required.',
      });
    }

    // Vérifier si un profil professionnel existe déjà
    const existingProfile = await Professional.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Professional profile already exists for this user.',
      });
    }

    // Créer un nouveau profil professionnel
    const professional = new Professional({
      userId,
      profession,
      experience,
      qualifications,
    });

    await professional.save();

    // Réponse de succès
    res.status(201).json({
      success: true,
      message: 'Professional profile created successfully.',
      data: {
        id: professional._id,
        userId: professional.userId,
        profession: professional.profession,
        experience: professional.experience,
        qualifications: professional.qualifications,
      },
    });
  } catch (error) {
    console.error('Error creating professional profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating professional profile.',
    });
  }
};
