# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache openssl libc6-compat

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS builder
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=$DATABASE_URL

# Build database package and generate Prisma client
RUN pnpm --filter @vanx/database build
RUN pnpm --filter @vanx/database db:generate

# Build API (prebuild will also build database, but explicit is better)
RUN pnpm --filter @vanx/api build

# Deploy to temp location with all dependencies
RUN pnpm --filter @vanx/api deploy --prod --legacy /tmp/api

# Verify Prisma client was deployed correctly
RUN test -f /tmp/api/node_modules/@vanx/database/prisma/generated/prisma/client.js || \
    (echo "ERROR: Prisma client not found in deployment" && exit 1)
RUN test -f /tmp/api/node_modules/@vanx/database/dist/index.js || \
    (echo "ERROR: Database package dist not found in deployment" && exit 1)

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH" \
    PORT=3001

RUN corepack enable && apk add --no-cache openssl libc6-compat

# Copy complete deployment including all dependencies
COPY --from=builder /tmp/api ./

EXPOSE 3001

# Production: No Prisma CLI, migrations handled separately via CI/CD
CMD ["node", "dist/src/main.js"]