# CI

GitHub Actions runs tests, builds and a coverage report on every pull request.
Everything is **path-filtered** — a frontend-only change never runs backend jobs
(and vice versa) — and self-contained (no external services; only the built-in
`GITHUB_TOKEN` is used to post the coverage comment).

## Layout

```
.github/
├── workflows/
│   ├── ci.yml          # entry point — orchestrates everything
│   ├── frontend.yml    # reusable: lint · test+coverage · build · docker · e2e
│   └── backend.yml     # reusable: vet · test+coverage · build · docker
├── actions/
│   ├── setup-frontend/ # composite: Node + Yarn 4 + cache + install + codegen
│   └── setup-backend/  # composite: Go toolchain + module/build cache
└── scripts/
    └── coverage-comment.mjs   # renders the head-vs-base coverage diff comment
```

`ci.yml` is the only workflow with triggers; `frontend.yml` and `backend.yml`
are **reusable** (`workflow_call`) and are invoked twice each — once for the PR
**head** (full pipeline) and once for the PR **base** (coverage only), so the
report can show the delta.

## What runs

| Job | Trigger | Blocking? |
|-----|---------|-----------|
| Lint / vet | app changed | ✅ yes |
| Unit + component tests (Vitest / Go) | app changed | ✅ yes |
| Build (`next build` / `go build`) | app changed | ✅ yes |
| Docker image build | app changed | ⚠️ no (`continue-on-error`) |
| E2E (Playwright) | frontend changed | ⚠️ no (`continue-on-error`) |
| Coverage report comment | PR, app changed | 📊 report only |

## Coverage report

The `coverage` job downloads the head and base coverage artifacts and runs
[`scripts/coverage-comment.mjs`](scripts/coverage-comment.mjs), which posts (and
updates in place) a single sticky comment with:

- a headline table of total coverage per app and its **Δ vs the base branch**,
- a per-metric breakdown for the frontend (lines / statements / functions / branches),
- the **files / functions whose coverage changed** between base and head.

Coverage tooling: the frontend uses Vitest's `v8` provider
(`yarn test:coverage`, scoped to `src/**`); the backend uses Go's native
`-coverprofile`. The first PR on a branch that predates this tooling will show
`🆕 no baseline` for the side that couldn't be computed, then shows real deltas
from then on.

## Tuning

- **Add a coverage gate** (currently report-only): fail the `coverage` job when a
  delta is negative, or add a threshold check in a test step.
- **Make e2e blocking**: drop `continue-on-error: true` from the `e2e` job in
  `frontend.yml`.
- **Change what counts as a "change"**: edit the `filters` in the `changes` job
  in `ci.yml` (anything under `.github/**` intentionally triggers both apps).
