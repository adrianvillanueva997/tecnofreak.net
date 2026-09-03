# Imagen de RUNTIME únicamente: el build de Next se hace en GitHub Actions
# (con Postgres efímero) y el .next compilado entra por el contexto.

FROM node:22.17.0-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencias de producción
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@latest && pnpm install --frozen-lockfile --prod

COPY .next ./.next
COPY public ./public
COPY src ./src
COPY scripts ./scripts
COPY next.config.ts ./
COPY redirects.ts ./
COPY tsconfig.json ./

RUN chown -R node:node /app/.next /app/public

USER node
EXPOSE 3000
ENV NODE_OPTIONS=--no-deprecation
CMD ["./node_modules/.bin/next", "start"]
