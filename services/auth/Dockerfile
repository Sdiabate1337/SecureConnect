# Utilisation de l'image officielle Node.js
FROM node:18

# Créer le répertoire de l'application
WORKDIR /app

# Copier le package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port 5000
EXPOSE 5000

# Lancer l'application
CMD ["node", "server.mjs"]
