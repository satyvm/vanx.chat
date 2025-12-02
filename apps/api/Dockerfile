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
RUN pnpm --filter @vanx/api build
RUN pnpm --filter @vanx/api deploy --prod --legacy /tmp/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH" \
    PORT=3001
RUN corepack enable && apk add --no-cache openssl libc6-compat
COPY --from=builder /tmp/api ./
RUN npm install -g prisma@^7.0.0
RUN prisma generate -- --config ./prisma.config.ts
EXPOSE 3001
CMD ["sh", "-c", "prisma -- --config ./prisma.config.ts migrate deploy && node dist/src/main.js"]