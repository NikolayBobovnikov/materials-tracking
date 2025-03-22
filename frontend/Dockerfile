FROM node:18.15.0-alpine AS builder

WORKDIR /app

# Install Python for schema generation
RUN apk add --update --no-cache python3

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the frontend source code
COPY . .

# Run schema generation script
RUN npm run schema

# Build the app
RUN npm run type-check-all
RUN npm run lint
RUN npm run relay
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
