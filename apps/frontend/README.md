# Wotermark Frontend

Web interface for Wotermark. Upload a watermark and a batch of images, then
download every one of them watermarked. Built with Next.js (App Router) and
exported as a fully static site.

## Technologies

- Next.js 16 (App Router, static export)
- React 19
- TypeScript
- Panda CSS (shadow-panda preset)
- Feature-Sliced Design in `src/`

## Local Development

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- Yarn

### Setup

```bash
yarn
```

### Running locally

Start the Go backend first (so API calls resolve), then:

```bash
yarn dev
```

The app runs at `http://localhost:5173`. In development `next dev` proxies
`/api/*` to the Go backend (`BACKEND_ORIGIN`, default `http://localhost:8080`),
so there's no CORS and you don't need the nginx router — just run the backend on
`:8080` alongside it. (5173 is also what the repo's nginx / docker compose setup
expects, so that path keeps working too.)

### Environment variables

Local defaults live in `.env.development` (committed — localhost-only, no
secrets) and load automatically with `yarn dev`. For production, set these
yourself (see `.env.example`):

| Variable | Used for | Local default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, Open Graph, sitemap, robots | `http://localhost:5173` |
| `BACKEND_ORIGIN` | dev-only `/api/*` proxy target | `http://localhost:8080` |

`NEXT_PUBLIC_SITE_URL` falls back to the production domain if unset, so the
static build is correct even without configuration. `BACKEND_ORIGIN` is only
used by `next dev` — the production static build has no API proxy (your reverse
proxy / Cloudflare serves `/api` there).

### Building for production

```bash
yarn build
```

This runs `panda codegen` then `next build`, producing a static export in
`./out`.

## Docker

```bash
docker build -t frontend .
docker run -p 5173:80 frontend
```

The image builds the static export and serves `./out` with `serve`.

## Testing

Two layers, both runnable locally.

### Unit / component / accessibility — Vitest

[Vitest](https://vitest.dev) with React Testing Library and
[`vitest-axe`](https://github.com/chaance/vitest-axe), running in jsdom.

```bash
yarn test         # run once
yarn test:watch   # watch mode
```

Test files live next to the code they cover (`*.test.ts` / `*.test.tsx`) and
exercise:

- `shared/lib/format` — file-size / mime / filename helpers
- `widgets/watermark-tool/lib/download` — base64 → blob decoding
- `entities/Watermark` — IndexedDB persistence (via `fake-indexeddb`)
- `widgets/contact-form` — submit/success/error flow (fetch mocked) + axe a11y scan
- `widgets/watermark-configuration` — controls render, opacity slider, + axe a11y scan

### End-to-end — Playwright

[Playwright](https://playwright.dev) drives a real Chromium browser, with
[`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) for
accessibility. Specs are in `e2e/` (fixtures in `e2e/fixtures/`).

```bash
npx playwright install chromium   # one-time: download the browser
yarn e2e            # headless (default)
yarn e2e:headed     # watch it run in a real visible browser (one at a time)
yarn e2e:ui         # Playwright UI mode: time-travel, DOM snapshots, re-run tests
yarn e2e --debug    # step through with the inspector
```

Playwright starts the dev server automatically (port 5173) and covers:

- home page title, `h1`, and navbar navigation to About/Contact
- an accessibility scan of the home page (expects zero violations)
- the contact form — success and server-error paths (`/api/contact` mocked)
- the upload → process → download flow (`/api/process-images` mocked), including
  partial failure (downloads only for the images that succeeded, error shown for
  the rest) and the all-failed case (no downloads, every error shown)

## Project Structure

```
app/          Next.js App Router (layout, pages, metadata: robots/sitemap/manifest)
src/
  app/        Island composition (WatermarkApp)
  widgets/    navbar, footer, watermark-tool, watermark-configuration, contact-form
  features/   FileUpload
  entities/   Watermark (IndexedDB persistence)
  shared/     ui (Panda components), context, lib, config
public/       icons, og image, service worker
```

The project follows Feature-Sliced Design (FSD). Interactive pieces are Client
Components (`'use client'`); the shell, content pages and SEO are server-rendered
at build time.

## Available Scripts

- `yarn dev` — start the dev server (port 5173)
- `yarn build` — Panda codegen + static export to `./out`
- `yarn start` — serve the built `./out` locally (run `yarn build` first)
- `yarn lint` — run ESLint
- `yarn test` — run the Vitest unit/component suite once
- `yarn test:watch` — Vitest in watch mode
- `yarn e2e` — run the Playwright end-to-end suite headless (needs `npx playwright install chromium` first)
- `yarn e2e:headed` — run the e2e suite in a visible browser, one test at a time
- `yarn e2e:ui` — open Playwright UI mode (interactive, time-travel debugging)
