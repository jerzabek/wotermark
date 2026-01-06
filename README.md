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

- Node.js 24.10 (LTS)
- Go 1.21+
- Docker (optional)

### Running Locally

```bash
docker compse up
```

Visit `http://localhost:3000` to access the application.

## Project Structure

```
wotermark/
├── wotermark-frontend/  # React frontend application
└── wotermark-backend/   # Go backend service
```

For detailed documentation about each component, please refer to their respective README files:

- [Frontend Documentation](./wotermark-frontend/README.md)
- [Backend Documentation](./wotermark-backend/README.md)
