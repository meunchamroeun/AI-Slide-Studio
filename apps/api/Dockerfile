# Multi-stage production Dockerfile for AI Slide Studio Backend (NestJS + Prisma + Playwright)
FROM node:20-bookworm-slim AS base

# Install system dependencies required by Prisma, Chromium / Playwright, and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    gnupg \
    procps \
    fonts-liberation \
    fonts-noto-core \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile=false

# Copy source trees
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared package
RUN pnpm --filter @ai-slide-studio/shared build

# Generate Prisma client
RUN pnpm --filter @ai-slide-studio/api db:generate

# Build NestJS API
RUN pnpm --filter @ai-slide-studio/api build

# Install Playwright browser binary
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install chromium

# Expose default port
EXPOSE 4000
ENV PORT=4000
ENV NODE_ENV=production

# Start command with automatic database migration
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/src/main.js"]
