# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile

FROM deps AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_HOTJAR_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_HOTJAR_ID=$NEXT_PUBLIC_HOTJAR_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @vanx/web build
RUN pnpm --filter @vanx/web deploy --prod --legacy /tmp/web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH" \
    PORT=3000
RUN corepack enable && apk add --no-cache libc6-compat
COPY --from=builder /tmp/web ./
EXPOSE 3000
CMD ["sh", "-c", "pnpm start -H 0.0.0.0 -p ${PORT:-3000}"]
