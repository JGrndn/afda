FROM node:22-alpine AS base

# ─── Étape 1 : dépendances ───────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─── Étape 2 : build ─────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Désactive la télémtrie Nextjs
ENV NEXT_TELEMETRY_DISABLED 1

# Le build Next.js a besoin de DATABASE_URL pour valider les imports Prisma
# On lui donne une valeur factice — la vraie sera injectée au runtime
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}

# Prisma génère le client à partir du schema
RUN npx prisma generate

RUN npm run build

# ─── Étape 3 : image finale (standalone) ─────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Désactive la télémtrie Nextjs
ENV NEXT_TELEMETRY_DISABLED 1

# Copier uniquement le nécessaire
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma : schema + client généré
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

# Script d'entrée qui lance les migrations puis démarre l'app
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]