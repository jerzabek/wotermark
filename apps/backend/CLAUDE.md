# Wotermark Backend

Go HTTP service for image watermarking + a contact-form relay. **Standard
library only for the web layer** (`net/http`, `http.ServeMux`) — no router
framework. Only two third-party deps: `joho/godotenv` (load `.env`) and
`nfnt/resize` (image scaling).

## Layout

```
cmd/server/main.go              entrypoint: hardened http.Server, graceful shutdown
internal/api/routes.go          SetupRoutes() wires the mux
internal/api/handlers/          HTTP handlers + their _test.go
  images.go    process-images   contact.go   contact form   health.go   health check
internal/image/models/          WatermarkConfig (JSON-tagged)
internal/image/processor/       ScaleImage, ApplyWatermark (pure image funcs)
```

`internal/` means nothing here is importable outside the module — keep it that
way unless there's a reason to expose a package.

## Endpoints

All under `/api`. See `README.md` for full request/response contracts.

- `POST /api/process-images` — multipart form (`watermark` file,
  `watermarkConfig` JSON, `images[0]`, `images[1]`, …). Scales each image to fit
  the output bounds (aspect preserved), centers an alpha-blended watermark,
  re-encodes in the source format (jpeg/png, default jpeg).
- `POST /api/contact` — JSON; relays to `CONTACT_WEBHOOK_URL` as IFTTT
  `{value1,value2,value3}`.
- `GET /api/health` — `{"status":"success"}`.

## Conventions

- **Handlers** are `func HandleXxx(w, r)`, exported from `package handlers`, and
  method-check up front (wrong method → `405`).
- **Logging**: `log.Printf` with a level prefix — `[ERROR]`, `[INFO]`, `[WARN]`.
- **JSON responses**: use the `writeJSONError(w, status, msg)` /
  `writeJSONSuccess(w)` helpers in `contact.go` rather than hand-rolling.
- **Tests**: Go `testing` + `net/http/httptest`, table-driven where it helps,
  **no external test deps**. Every handler and the processor are covered,
  including partial-failure and all-failed paths. Run `go test ./...`.

## process-images semantics (don't break these)

- `images` and `errors` in the response are **index-aligned** with the uploaded
  order. Success → base64 string in `images[i]`, `null` in `errors[i]`.
  Failure → `null` in `images[i]`, message in `errors[i]`. A failed image never
  fails the whole request (still `200`).
- Work runs through a **bounded worker pool** sized to `runtime.NumCPU()`;
  results are written into pre-sized slices by index (no append races).
- Safety limits live as consts in `images.go`: `maxImagesPerRequest = 100`,
  `maxPixels = 50_000_000` (decompression-bomb guard, per image **and** the
  watermark), `maxMultipartMemory = 32MB`. Contact body is capped at 16KB.
  Adjust the consts, not magic numbers scattered around.

## Config

Env via `.env` (see `.env.example`):

- `PORT` (default `8080`).
- `CONTACT_WEBHOOK_URL` — IFTTT Maker webhook. **If unset, `/api/contact`
  returns `503`** (by design); the rest of the API is unaffected.

## Run

```bash
go run ./cmd/server      # or: go build -o wotermark ./cmd/server && ./wotermark
go test ./...
docker build -t backend .
```
