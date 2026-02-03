# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if we needed SPA routing support, but default works for simple apps.
# For /health to work, it's just a file in the root, so it works under default nginx config.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
