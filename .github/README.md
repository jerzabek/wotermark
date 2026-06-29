# CI

GitHub Actions runs tests, builds and a coverage report on every pull request.
Everything is **path-filtered** — a frontend-only change never runs backend jobs
(and vice versa) — and the coverage diff comments come from off-the-shelf actions
posting via the built-in `GITHUB_TOKEN` (no external coverage service).

## Layout

```
.github/
├── workflows/
│   ├── ci.yml          # entry point — orchestrates everything
│   ├── frontend.yml    # reusable: lint · test+coverage · build · docker · e2e
│   └── backend.yml     # reusable: vet · test+coverage · build · docker
└── actions/
    ├── setup-frontend/ # composite: Node + Yarn 4 + cache + install + codegen
    └── setup-backend/  # composite: Go toolchain + module/build cache
```

`ci.yml` is the only workflow with triggers; `frontend.yml` and `backend.yml`
are **reusable** (`workflow_call`). `frontend.yml` is invoked twice — once for the
PR **head** (full pipeline) and once for the PR **base** (coverage only) — so the
frontend report can show a delta. The backend tracks its own baseline (see below),
so it only runs once.

## What runs

| Job | Trigger | Blocking? |
|-----|---------|-----------|
| Lint / vet | app changed | ✅ yes |
| Unit + component tests (Vitest / Go) | app changed | ✅ yes |
| Build (`next build` / `go build`) | app changed | ✅ yes |
| Docker image build | app changed | ⚠️ no (`continue-on-error`) |
| E2E (Playwright) | frontend changed | ⚠️ no (`continue-on-error`) |
| Coverage diff comment | PR, app changed | 📊 report only |

## Coverage report

Each app posts its own coverage comment with the **diff vs the base branch**,
using a maintained action — no custom scripts:

- **Frontend** — [`davelosert/vitest-coverage-report-action`](https://github.com/davelosert/vitest-coverage-report-action).
  Vitest's `v8` provider (`yarn test:coverage`, scoped to `src/**`) emits a
  `coverage-summary.json` for the head and the base; the action renders the table
  and the per-file changes. The base summary is produced by the `frontend (base)`
  run; on the first PR before the base has the tooling, the trend is simply
  omitted.
- **Backend** — [`gwatts/go-coverage-action`](https://github.com/gwatts/go-coverage-action).
  Runs `go test` with coverage and records the baseline in **git notes**
  (`refs/notes/gocoverage`), so it reports the delta against the base branch with
  no separate base run. (This is why the backend job has `contents: write`.)

## Tuning

- **Add a coverage gate** (currently report-only): set `fail-coverage` /
  `coverage-threshold` on the backend action, and vitest `thresholds` (surfaced
  by the frontend action) for the frontend.
- **Make e2e blocking**: drop `continue-on-error: true` from the `e2e` job in
  `frontend.yml`.
- **Change what counts as a "change"**: edit the `filters` in the `changes` job
  in `ci.yml` (anything under `.github/**` intentionally triggers both apps).
