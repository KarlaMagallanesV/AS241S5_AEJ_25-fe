# Etapa 1: Build usando la imagen de Bun basada en Debian (más compatible con Node 22)
FROM oven/bun:1.3-slim AS builder
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

# Copiamos el resultado del build. 
# Usamos un wildcard para manejar posibles variaciones en el nombre del proyecto o mayúsculas/minúsculas
COPY --from=builder /app/dist/*/ ./dist/

EXPOSE 4000

# El punto de entrada para Angular SSR con el nuevo builder es server/server.mjs
CMD ["node", "dist/server/server.mjs"]
