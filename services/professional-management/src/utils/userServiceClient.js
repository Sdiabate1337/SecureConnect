
// utils/userServiceClient.js
import axios from 'axios';

const userServiceClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL, // L'URL du User Service, définie dans les variables d'environnement
  timeout: 5000, // Timeout de 5 secondes
});

// Obtenir les informations d'un utilisateur par ID
export const getUserById = async (userId) => {
  try {
    const response = await userServiceClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user info for userId: ${userId}`, error.response?.data || error.message);
    throw new Error('Failed to fetch user info.');
  }
};