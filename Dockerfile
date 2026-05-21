# Etapa 1: Instalación y Build con Bun
FROM oven/bun:1.0-alpine AS builder
WORKDIR /app

# Copia archivos de dependencias
COPY package.json bun.lockb ./
RUN bun install

# Copia el resto y construye
COPY . .
RUN bun run build --configuration=production

# Etapa 2: Ejecución (SSR)
FROM node:18-alpine
WORKDIR /app

# Copiamos el resultado del build (servidor y navegador)
COPY --from=builder /app/dist/frontend-api-ai ./dist/frontend-api-ai

# Exponer el puerto por defecto de Angular SSR
EXPOSE 4000

# Comando para arrancar el servidor de Angular
CMD ["node", "dist/frontend-api-ai/server/main.js"]