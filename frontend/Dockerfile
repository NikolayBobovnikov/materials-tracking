FROM node:18.15.0-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Run enhanced type checking
RUN npm run type-check-all

# Run linting
RUN npm run lint

# Run the Relay compiler
RUN npm run relay

# Build the application
RUN npm run build

# Use nginx to serve the built application
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
