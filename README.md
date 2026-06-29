# Wotermark

A web application for applying watermarks to multiple images simultaneously. Built with Next.js and Go.

## Technologies

### Frontend

- Next.js (App Router, static export)
- React
- TypeScript
- Panda CSS

### Backend

- Go
- net/http for REST API
- Image processing libraries

## Development

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- Go 1.21+
- Docker (optional)

### Running Locally

Run the backend and the frontend. In development the frontend dev server
proxies `/api/*` to the backend, so no extra wiring is needed:

```bash
# Terminal 1 — backend (http://localhost:8080)
cd apps/wotermark-backend && go run ./cmd/server

# Terminal 2 — frontend (http://localhost:5173)
cd apps/wotermark-frontend && yarn && yarn dev
```

Then visit `http://localhost:5173`.

#### Alternative: nginx router (single-origin, prod-like)

`docker compose up` starts an nginx router on `http://localhost:3000` that
proxies `/` to the frontend (`:5173`) and `/api` to the backend (`:8080`). Run
the frontend and backend as above, then visit `http://localhost:3000`.

## Testing

Both apps ship with automated tests:

```bash
# Frontend — unit, component & accessibility (Vitest)
cd apps/wotermark-frontend && yarn test

# Frontend — end-to-end (Playwright; first run only: npx playwright install chromium)
cd apps/wotermark-frontend && yarn e2e

# Backend — unit & handler tests (Go)
cd apps/wotermark-backend && go test ./...
```

- **Frontend** — [Vitest](https://vitest.dev) + React Testing Library + `vitest-axe`
  for units/components/accessibility, and [Playwright](https://playwright.dev) +
  `axe-core` for end-to-end flows in a real browser.
- **Backend** — Go's standard `testing` with `net/http/httptest`, covering the
  image processor and every API handler.

See each component's README for the full breakdown of what's covered.

## Continuous Integration

Every pull request runs lint, tests, builds and a coverage report via GitHub
Actions. Jobs are **path-filtered** (a frontend change doesn't trigger backend
jobs, and vice versa) and a sticky PR comment reports total coverage per app
plus the **diff against the base branch**. See [`.github/README.md`](./.github/README.md)
for the full design.

## Project Structure

```
wotermark/
└── apps/
    ├── wotermark-frontend/  # Next.js frontend (static export)
    └── wotermark-backend/   # Go backend service
```

For detailed documentation about each component, please refer to their respective README files:

- [Frontend Documentation](./apps/wotermark-frontend/README.md)
- [Backend Documentation](./apps/wotermark-backend/README.md)
