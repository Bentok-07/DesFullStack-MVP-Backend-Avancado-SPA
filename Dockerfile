# 1) Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Runtime (Nginx)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Fallback de rotas (sem arquivo externo, gerando o default.conf via printf)
RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / { try_files $uri /index.html; }' \
  '  add_header Cache-Control "no-store";' \
  '}' \
  > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
