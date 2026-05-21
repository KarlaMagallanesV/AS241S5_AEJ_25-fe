# Etapa 1: Build usando la imagen de Bun basada en Debian (más compatible con Node 22)
FROM oven/bun:1.2-slim AS builder
WORKDIR /app

# Copia archivos de configuración
COPY package.json bun.lock* ./

# Instala dependencias
RUN bun install

# Copia el código fuente
COPY . .

# Ejecutamos el build
RUN bun run build --configuration=production

# Etapa 2: Run (SSR)
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist/frontend-api-ai ./dist/frontend-api-ai
EXPOSE 4000

CMD ["node", "dist/frontend-api-ai/server/main.js"]
