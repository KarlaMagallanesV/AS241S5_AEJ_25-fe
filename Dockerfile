# Etapa 1: Build
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

# Copiamos package.json y usamos un comodín para el lockfile de Bun
# Esto evita el error si se llama bun.lock o bun.lockb
COPY package.json bun.lock* ./

RUN bun install

COPY . .
# Ejecuta el build (generará la carpeta dist/frontend-api-ai)
RUN bun run build --configuration=production

# Etapa 2: Run (SSR)
FROM node:20-alpine
WORKDIR /app

# Basado en tu angular.json, la carpeta se llama frontend-api-ai
# Copiamos todo el contenido de la carpeta de salida
COPY --from=builder /app/dist/frontend-api-ai ./dist/frontend-api-ai

EXPOSE 4000

# Comando para arrancar el servidor de Angular 21 SSR
CMD ["node", "dist/frontend-api-ai/server/main.js"]