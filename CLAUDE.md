# Wotermark

Batch image watermarking tool. Upload one watermark + many images, get them all
watermarked. Two apps in one repo:

- `apps/frontend/` — Next.js 16 App Router, exported as a **fully static**
  site (no Node server at runtime). See `apps/frontend/CLAUDE.md`.
- `apps/backend/` — Go service (stdlib `net/http`, no framework) that does
  the image processing and proxies the contact form. See
  `apps/backend/CLAUDE.md`.

The frontend is static and talks to the backend only over **relative `/api/*`
URLs** — never hardcode the backend origin in frontend code. Routing of `/api`
to the backend is an infrastructure concern (dev proxy / nginx / Cloudflare),
not an app concern.

## Running locally

Two terminals — backend first, then frontend:

```bash
# backend → http://localhost:8080
cd apps/backend && go run ./cmd/server

# frontend → http://localhost:5173
cd apps/frontend && yarn && yarn dev
```

In dev, `next dev` rewrites `/api/*` to the backend (`BACKEND_ORIGIN`, default
`http://localhost:8080`), so there's no CORS and no extra wiring — just have the
backend up on `:8080`.

Optional prod-like single origin: `docker compose up` starts an nginx router on
`http://localhost:3000` that proxies `/` → `:5173` and `/api` → `:8080` (see
`nginx.conf`). Still requires the two dev servers running.

## Testing

```bash
cd apps/frontend && yarn test   # Vitest: unit/component/a11y
cd apps/frontend && yarn e2e    # Playwright (first run: npx playwright install chromium)
cd apps/backend  && go test ./...
```

## Toolchain

- Node 24 (`.nvmrc`), Yarn 4 (Berry, pinned in `.yarn/`) — use `yarn`, not npm.
- Go 1.21+ (the Docker build uses 1.23.5).

## Deployment

Frontend builds to a static export (`./out`) served by a static host /
Cloudflare; the backend runs as a container serving `/api`. The contact form
forwards to an IFTTT Maker webhook (`CONTACT_WEBHOOK_URL`).

The per-app READMEs (`README.md`, `apps/frontend/README.md`,
`apps/backend/README.md`) are detailed and current — read them for API
contracts, env vars, and the full test matrix.
