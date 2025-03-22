# Stage 1: Build backend to generate schema
FROM python:3.10-slim AS backend-builder

WORKDIR /backend

# Copy backend files
COPY backend/ .

# Install backend dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Generate schema
RUN python generate_schema.py

# Stage 2: Build frontend
FROM node:18.15.0-alpine AS frontend-builder

WORKDIR /app

# Copy package files first (for better caching)
COPY frontend/package*.json ./
RUN npm install

# Copy the frontend source code
COPY frontend/ .

# Copy schema from backend stage
COPY --from=backend-builder /backend/schema.graphql ./schema.graphql

# Build the app 
RUN npm run build

# Stage 3: Production
FROM nginx:alpine

# Copy built frontend
COPY --from=frontend-builder /app/build /usr/share/nginx/html
COPY --from=frontend-builder /app/schema.graphql /usr/share/nginx/html/schema.graphql
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
