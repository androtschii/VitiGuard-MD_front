# Сайт для сервера (pr-100): сборка Vite и раздача через Caddy. Caddy сам
# получает сертификат Let's Encrypt для SITE_ADDRESS и проксирует /api на API
FROM node:24.22.0-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build


FROM caddy:2.11.6-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
