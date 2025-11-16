## Docker environment

1. Copy `.env.example` to `.env` and change any values you need (ports, Postgres creds, public API URLs, analytics IDs, etc.).
2. Build everything once with `docker compose build`.
3. Run the full stack with `docker compose up -d` (or remove `-d` to keep logs in the foreground).
4. When you need to publish container images, run `./scripts/push-images.sh my-tag` (defaults to `latest`). Make sure you’re logged in to `registry.digitalocean.com` first, or override the registry via `REGISTRY=...`. Images build for `linux/amd64` by default—set `TARGET_PLATFORM` if you need something else.

If the API is hosted on a different subdomain than the web app (for example `api.example.com` vs `app.example.com`), set `COOKIE_DOMAIN` in `.env` to a shared parent domain such as `.example.com`. This ensures the browser sends the auth cookies back to both the API (where they were set) and the web frontend, allowing redirects and middleware guards to work correctly in production.

Services:

- `postgres`: persistent database with health checks and the credentials from `.env`.
- `api`: NestJS service built from `apps/api/Dockerfile`; automatically waits for Postgres.
- `web`: Next.js app from `apps/web/Dockerfile`, exposes the port defined in `.env`.
- `www`: Static Astro marketing site packaged behind nginx.

Useful helpers:

- `docker compose logs -f api` (or `web`, `www`, `postgres`) to tail logs.
- `docker compose up -d api web` to start only the app surfaces without the marketing site.
- `docker compose down -v` to tear down everything and drop the Postgres volume.
- `pnpm docker:coolify` regenerates `docker-compose.coolify.yml` without host port bindings so Coolify can proxy the services safely.
