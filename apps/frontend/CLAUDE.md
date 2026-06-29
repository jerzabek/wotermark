# Wotermark Frontend

Next.js 16 (App Router) + React 19 + TypeScript, **exported as a fully static
site** (`output: 'export'` → `./out`, no Node server at runtime). Styling is
Panda CSS via the `@shadow-panda/preset`. Source follows **Feature-Sliced
Design (FSD)**.

## Architecture: two roots

- **`app/`** — Next.js App Router: `layout.tsx`, content pages (`about`,
  `contact`, `privacy`), and build-time SEO (`robots.ts`, `sitemap.ts`,
  `manifest.ts`). These are **server components**, rendered at build time.
- **`src/`** — FSD layers, lower can import from higher only:
  ```
  app/       island composition (WatermarkApp — the 'use client' root)
  widgets/   navbar, footer, watermark-tool, watermark-configuration, contact-form
  features/  FileUpload
  entities/  Watermark (IndexedDB persistence via idb)
  shared/    ui (Panda components), context, lib, config
  ```

Interactive pieces are **client islands** (`'use client'`) mounted into otherwise
static pages — e.g. `app/page.tsx` renders the static hero + SEO, then mounts
`<WatermarkApp>`. Keep SEO/content server-rendered; only the interactive tool is
client-side.

## Conventions

- **Barrel exports**: every slice exposes a public API via `index.ts`. Import
  from the slice root (`@/widgets/watermark-tool`, `@/shared/ui`,
  `@/entities/Watermark`) — **not** deep paths into a slice's internals.
- **Import alias**: `@/*` → `src/*` (configured in `tsconfig.json` and mirrored
  in `vitest.config.ts`).
- **Import order is enforced by Biome** (`organizeImports`): imports are grouped
  (external → internal `@/**` → relative, separated by blank lines) and sorted
  within each group. Run `yarn lint` (check) or `yarn lint:fix` (auto-fix).
- **State**: the watermark + its config live in `WatermarkProvider` context;
  consume via `useWatermark()`. The current watermark is persisted to
  **IndexedDB** through `entities/Watermark` so it survives reloads.
- **Backend calls** use **relative `/api/*`** with `fetch` + `FormData` (see
  `widgets/watermark-tool`). Never hardcode the backend origin — dev proxies it
  (`BACKEND_ORIGIN`), prod serves it via the reverse proxy.

## Styling (Panda CSS)

- `@shadow-panda/styled-system/**` is **generated** by `panda codegen` (runs in
  `yarn prepare` and `yarn build`). **Never edit it by hand** and don't commit
  fixes there — change `panda.config.ts` and regenerate. It's gitignored and
  excluded from Biome.
- Use `css({...})` for one-offs, JSX primitives from
  `@shadow-panda/styled-system/jsx` (`Box`, `VStack`, `HStack`) for layout, and
  recipes from `.../recipes` (`button`, etc.) for variants.
- Custom semantic tokens: `wmBg`, `wmText`, `wmAccent`, `wmSlider` (light/dark
  pairs). Dark mode is the `.dark` class on `<html>`, toggled via `localStorage`
  + a pre-paint inline script in `layout.tsx`; style dark variants with `_dark`.
- **Accessibility is first-class** — keep it that way: visible `focus-visible`
  outlines, `prefers-reduced-motion` handling (both in `globalCss`), the skip
  link, `aria-live` status regions, and accessible names on inputs.

## Commands

```bash
yarn dev          # dev server on :5173, proxies /api/* to BACKEND_ORIGIN
yarn build        # panda codegen + next build → static export in ./out
yarn start        # serve the built ./out (run yarn build first)
yarn lint         # Biome: lint + format check (yarn lint:fix to auto-fix, yarn format to format)
yarn test         # Vitest (jsdom): unit + component + vitest-axe a11y
yarn e2e          # Playwright (first run: npx playwright install chromium)
```

## Tests

- Vitest specs are **colocated** as `*.test.ts(x)` next to the code; RTL +
  `vitest-axe` in jsdom. Playwright e2e lives in `e2e/` (fixtures in
  `e2e/fixtures/`); Playwright auto-starts `yarn dev` and mocks `/api/*`.

## Config / env

- `src/shared/config/site.ts` is the single source of truth for site metadata.
- `NEXT_PUBLIC_SITE_URL` — canonical URLs / OG / sitemap (falls back to prod
  domain). `BACKEND_ORIGIN` — **dev-only** `/api` proxy target. Local defaults
  are committed in `.env.development`; see `.env.example` for production.
