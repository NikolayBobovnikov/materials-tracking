FROM node:18.15.0-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm list typescript || true
RUN npm install -D typescript@4.9.5
COPY . .
RUN npm run type-check-all
RUN npm run lint
RUN npm run relay
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
