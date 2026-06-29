# Wotermark Backend

A Go service that handles image watermarking operations. This service allows you to apply watermarks to multiple images simultaneously with configurable size and opacity settings. It also exposes a contact form endpoint that forwards messages to an IFTTT Maker webhook.

## Local Development

### Prerequisites
- Go 1.21 or higher
- Git

### Setup
1. Clone the repository
2. Install dependencies:
```bash
go mod download
```

### Environment Variables
Create a `.env` file in the root directory:
```plaintext
# Port the HTTP server listens on (default: 8080)
PORT=8080

# IFTTT Maker webhook URL used by the contact form. If unset, the contact
# endpoint responds with 503 (Contact form is not configured).
CONTACT_WEBHOOK_URL=https://maker.ifttt.com/trigger/<event>/with/key/<your_key>
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `8080` | Port the HTTP server listens on. |
| `CONTACT_WEBHOOK_URL` | No | _(empty)_ | IFTTT Maker webhook URL for the contact form. If empty, `/api/contact` returns 503. |

### Running Locally
```bash
# Run directly with Go
go run cmd/server/main.go

# Or build and run the binary
go build -o wotermark ./cmd/server
./wotermark
```

The server starts an `http.Server` with hardened timeouts (read-header 10s,
read 60s, write 120s, idle 120s) and supports graceful shutdown on
`SIGINT`/`SIGTERM`.

### Testing

Standard Go tests (table-driven where it helps), no external test deps:

```bash
go test ./...          # run all tests
go test -v ./...       # verbose
go test -cover ./...   # with coverage
```

What's covered:

- `internal/image/processor` — `ScaleImage` preserves aspect ratio and fits the
  target bounds across several sizes; `ApplyWatermark` keeps the source bounds,
  actually blends at the centre, and honours the opacity argument.
- `internal/api/handlers` (via `net/http/httptest`):
  - **process-images** — happy path (200, index-aligned `images`/`errors`),
    missing config (400), missing watermark (400), wrong method (405), invalid
    configs (400), **partial failure** (one image decodes, one doesn't → 200 with
    the good slot's base64 + the bad slot `null` and an error at the same index),
    and **all-failed** (200 with every image `null` and every error populated).
  - **contact** — happy path (asserts the stub webhook receives `value1/2/3`),
    honeypot drop (200, webhook not called), invalid fields (400), unset
    `CONTACT_WEBHOOK_URL` (503), webhook failure (502), wrong method (405).
  - **health** — GET (200) and non-GET (405).

## Docker

### Building the Image
```bash
docker build -t wotermark-backend .
```

### Running with Docker
```bash
docker run -p 8080:8080 --env-file .env wotermark-backend
```

## API Documentation

### Health Check
```http
GET /api/health
```
Returns server status. Non-GET requests return `405 Method Not Allowed`.

**Response:**
```json
{ "status": "success" }
```

### Process Images
```http
POST /api/process-images
Content-Type: multipart/form-data
```

Scales each uploaded image to fit within the requested output bounds (aspect
ratio preserved), centers a scaled watermark on top with alpha blending, and
returns the encoded results.

**Form Data Parameters:**
- `watermarkConfig` (JSON string):
  ```json
  {
    "outputWidth": 1920,
    "outputHeight": 1080,
    "watermarkSize": 30,
    "watermarkOpacity": 0.5
  }
  ```
  - `outputWidth` / `outputHeight`: target bounds, each must be in `[1, 8000]`.
  - `watermarkSize`: watermark height as a percentage of the scaled image
    height, must be in `(0, 100]`.
  - `watermarkOpacity`: blend opacity in `[0, 1]`. If `<= 0`, defaults to `0.5`.
- `watermark` (file): Image to use as watermark.
- `images[0]`, `images[1]`, ... (files): Images to process, indexed from 0.
  Maximum of **100** images per request.

**Limits & safety:**
- Multipart form is parsed with a 32MB in-memory limit.
- Images larger than 50 megapixels (`width * height > 50,000,000`) are rejected:
  per-image they appear as an error entry; a watermark over 50MP returns 400.
- Invalid config or too many images returns `400`.
- Wrong HTTP method returns `405`.

**Response:**
```json
{
  "images": ["<base64_encoded_image_1>", "<base64_encoded_image_2>"],
  "errors": [null, null]
}
```
The `images` and `errors` arrays are index-aligned with the uploaded image
order. A successfully processed image is a base64-encoded string at its index
(with `null` in `errors`); a failed image is `null` at its index in `images`
with the error message at the same index in `errors`.

### Contact
```http
POST /api/contact
Content-Type: application/json
```

Forwards a contact-form submission to the configured IFTTT Maker webhook. The
request body is capped at ~16KB. Non-POST requests return `405`.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello!",
  "website": ""
}
```
- `name`: required, 1–200 characters.
- `email`: required, must match a basic email format.
- `message`: required, 1–5000 characters.
- `website`: honeypot. If non-empty, the submission is silently dropped (bots)
  and the endpoint still returns `200`.

**Responses:**
- `200` `{ "status": "success" }` — delivered (or honeypot dropped).
- `400` `{ "error": "..." }` — invalid/missing fields or malformed JSON.
- `503` `{ "error": "Contact form is not configured" }` — `CONTACT_WEBHOOK_URL`
  is not set.
- `502` `{ "error": "Failed to deliver message" }` — the webhook errored or
  returned a non-2xx status.

When delivered, the backend POSTs the following JSON to `CONTACT_WEBHOOK_URL`
(IFTTT Maker format):
```json
{ "value1": "<name>", "value2": "<email>", "value3": "<message>" }
```

#### IFTTT Maker webhook setup (brief)
1. Create an IFTTT applet with the **Webhooks** service as the trigger
   ("Receive a web request") and pick an event name.
2. For the action, use the **Email** (or Gmail) service to "Send me an email".
3. In the email body, reference the incoming fields with `{{Value1}}`
   (name), `{{Value2}}` (email), and `{{Value3}}` (message).
4. Grab your key from the Webhooks service settings and set
   `CONTACT_WEBHOOK_URL=https://maker.ifttt.com/trigger/<event>/with/key/<key>`.

## Project Structure
```
wotermark-backend/
├── cmd/
│   └── server/           # Application entrypoint (hardened http.Server, graceful shutdown)
├── internal/
│   ├── api/              # API routes and handlers (process-images, contact, health)
│   └── image/            # Image processing logic (scaling, watermarking)
├── go.mod
├── go.sum
└── Dockerfile
```
