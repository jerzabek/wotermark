# Wotermark

A web application for applying watermarks to multiple images simultaneously. Built with React and Go.

## Technologies

### Frontend
- React
- TypeScript
- Vite
- Panda CSS

### Backend
- Go
- net/http for REST API
- Image processing libraries

## Development

### Prerequisites
- Node.js 20+
- Go 1.21+
- Docker (optional)

### Running Locally

#### Frontend
```bash
cd wotermark-frontend
yarn
yarn dev
```
Frontend will be available at `http://localhost:5173`

#### Backend
```bash
cd wotermark-backend
go mod download
go run cmd/server/main.go
```
Backend API will be available at `http://localhost:8080`

## Docker Deployment

### Using Docker Compose (Recommended)
The easiest way to run the entire application:

```bash
docker compose up -d
```

To stop the application:
```bash
docker compose down
```

### Manual Docker Setup

#### Build Images
```bash
# Build frontend
cd wotermark-frontend
docker build -t wotermark-frontend .

# Build backend
cd ../wotermark-backend
docker build -t wotermark-backend .
```

#### Run Containers
```bash
# Run backend
docker run -d -p 8080:8080 --env-file wotermark-backend/.env wotermark-backend

# Run frontend
docker run -d -p 5173:80 wotermark-frontend
```

Visit `http://localhost:5173` to access the application.

## Project Structure
```
wotermark/
├── wotermark-frontend/  # React frontend application
└── wotermark-backend/   # Go backend service
```

For detailed documentation about each component, please refer to their respective README files:
- [Frontend Documentation](./wotermark-frontend/README.md)
- [Backend Documentation](./wotermark-backend/README.md)
