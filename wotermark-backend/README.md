# Wotermark Backend

A Go service that handles image watermarking operations. This service allows you to apply watermarks to multiple images simultaneously with configurable size and opacity settings.

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
PORT=8080
```

### Running Locally
```bash
# Run directly with Go
go run cmd/server/main.go

# Or build and run the binary
go build -o wotermark ./cmd/server
./wotermark
```

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
Returns server status.

### Process Images
```http
POST /api/process-images
Content-Type: multipart/form-data
```

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
- `watermark` (file): Image to use as watermark
- `images[]` (files): Array of images to process

**Response:**
```json
{
  "images": ["base64_encoded_image_1", "base64_encoded_image_2"],
  "errors": [null, null]
}
```

## Project Structure
```
wotermark-backend/
├── cmd/
│   └── server/           # Application entrypoint
├── internal/
│   ├── api/             # API routes and handlers
│   └── image/           # Image processing logic
├── go.mod
├── go.sum
└── Dockerfile
```