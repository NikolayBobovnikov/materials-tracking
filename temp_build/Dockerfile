FROM node:18.15.0-alpine AS builder

WORKDIR /app

# Install Python for schema generation
RUN apk add --update --no-cache python3

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the frontend source code
COPY . .

# Create a simple helper script for schema generation during docker-compose build
RUN echo '#!/bin/sh\n\
if [ -d "/backend_mount" ] && [ -f "/backend_mount/generate_schema.py" ]; then\n\
  echo "Generating schema from mounted backend"\n\
  cd /backend_mount && python3 generate_schema.py\n\
  exit $?\n\
fi\n\
echo "No backend mount found, using existing schema"\n\
exit 0' > /app/generate-schema.sh && chmod +x /app/generate-schema.sh

# Run schema generation script
RUN /app/generate-schema.sh

# Build the app
RUN npm run lint
RUN npm run relay
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
