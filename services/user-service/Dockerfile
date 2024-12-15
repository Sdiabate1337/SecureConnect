FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the app's port
EXPOSE 5001

# Start the application
CMD ["node", "src/server.js"]
