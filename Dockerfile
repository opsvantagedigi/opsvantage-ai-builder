FROM node:20-alpine AS base

RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_MARZ_VIDEO_MODE
ARG NEXT_PUBLIC_NEURAL_CORE_URL
ARG NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_URL
ARG NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_TOKEN
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ARG NEXT_PUBLIC_METRICS_URL
ARG NEXTAUTH_SECRET
ENV DATABASE_URL=${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=require}
ENV NEXT_PUBLIC_MARZ_VIDEO_MODE=${NEXT_PUBLIC_MARZ_VIDEO_MODE:-false}
ENV NEXT_PUBLIC_NEURAL_CORE_URL=${NEXT_PUBLIC_NEURAL_CORE_URL:-}
ENV NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_URL=${NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_URL:-}
ENV NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_TOKEN=${NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_TOKEN:-}
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY:-}
ENV NEXT_PUBLIC_METRICS_URL=${NEXT_PUBLIC_METRICS_URL:-}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-}
ENV SKIP_DB_CHECK_DURING_BUILD=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_PUBLIC_MARZ_VIDEO_MODE=true
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/.next-build ./.next-build
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 8080
CMD ["sh", "-c", "npm start -- -p ${PORT:-8080}"]
