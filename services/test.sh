#!/bin/bash

# Étape 1 : Enregistrement d'un utilisateur
echo "Registering a new user..."
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "user2", "email": "user2@example.com", "password": "password", "role": "USER"}'

# Étape 2 : Connexion pour obtenir un token
echo "Logging in to get JWT token..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user2@example.com", "password": "password"}' | jq -r '.token')

echo "Generated Token: $TOKEN"

# Étape 3 : Test de récupération du profil utilisateur
if [ "$TOKEN" != "null" ]; then
  echo "Testing user profile endpoint..."
  curl -X GET http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
else
  echo "Failed to generate token. Check backend logs for more details."
fi
