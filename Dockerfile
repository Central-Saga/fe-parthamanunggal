# Multi-stage Dockerfile for Next.js 15 (standalone)

FROM node:20-alpine AS base
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM deps AS builder
WORKDIR /app
COPY . .
# Inject public envs at build time so client bundle uses correct API base
# Accept both names for flexibility
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_USE_SERVER_AUTH
ARG NEXT_PUBLIC_USE_SANCTUM
ARG NEXT_PUBLIC_AUTO_LOGIN
ARG NEXT_PUBLIC_AUTO_LOGIN_EMAIL
ARG NEXT_PUBLIC_AUTO_LOGIN_PASSWORD
ARG INTERNAL_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_USE_SERVER_AUTH=${NEXT_PUBLIC_USE_SERVER_AUTH}
ENV NEXT_PUBLIC_USE_SANCTUM=${NEXT_PUBLIC_USE_SANCTUM}
ENV NEXT_PUBLIC_AUTO_LOGIN=${NEXT_PUBLIC_AUTO_LOGIN}
ENV NEXT_PUBLIC_AUTO_LOGIN_EMAIL=${NEXT_PUBLIC_AUTO_LOGIN_EMAIL}
ENV NEXT_PUBLIC_AUTO_LOGIN_PASSWORD=${NEXT_PUBLIC_AUTO_LOGIN_PASSWORD}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
