# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages ./packages
COPY apps/www ./apps/www
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @vanx/www build

FROM nginx:1.29-alpine AS runner
WORKDIR /usr/share/nginx/html
COPY apps/www/docker-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/www/dist ./
EXPOSE 4321
