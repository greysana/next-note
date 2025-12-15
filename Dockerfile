# Dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Only set NEXT_PUBLIC_* variables needed at build time
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Server-side variables are NOT needed at build time
# They will be injected at runtime by Kubernetes

# Build the Next.js app
RUN npm run build

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0" 

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Runtime environment variables will be injected by Kubernetes
CMD ["node", "server.js"]