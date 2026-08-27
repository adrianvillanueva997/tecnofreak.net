# Imagen de RUNTIME únicamente: el build de Next se hace en GitHub Actions
# (con Postgres efímero) y el .next compilado entra por el contexto.

FROM node:22.17.0-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencias de producción
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

# Artefacto de build + estáticos + config
COPY .next ./.next
COPY public ./public
COPY next.config.ts ./

RUN chown -R node:node /app/.next /app/public

USER node
EXPOSE 3000
ENV NODE_OPTIONS=--no-deprecation
CMD ["./node_modules/.bin/next", "start"]
