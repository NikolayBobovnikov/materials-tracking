# Development & Testing Stage
FROM node:18.15.0-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the frontend source code
COPY . .

# Expose port 3000 for the development server
EXPOSE 3000

# Default command runs the development server
CMD ["npm", "start"]
