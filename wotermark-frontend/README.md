# Wotermark Frontend

React-based web interface for the Wotermark application. Allows users to upload multiple images and apply customizable watermarks.

## Technologies
- React 18
- TypeScript
- Vite
- Panda CSS
- ESLint

## Local Development

### Prerequisites
- Node.js 20+
- Yarn

### Setup
1. Install dependencies:
```bash
yarn
```

### Environment Variables
Create a `.env` file in the root directory:
```plaintext
VITE_API_URL=http://localhost:8080
```

### Running Locally
```bash
yarn dev
```
The application will be available at `http://localhost:5173`

### Building for Production
```bash
yarn build
```

## Docker

### Building the Image
```bash
docker build -t wotermark-frontend .
```

### Running with Docker
```bash
docker run -p 5173:80 wotermark-frontend
```

## Project Structure

The project follows Feature-Sliced Design (FSD) methodology, organizing code into layers (shared, entities, features, widgets, pages) for better maintainability and scalability.

```
wotermark-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── index.html         # Entry HTML file
```

## Available Scripts
- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn preview`: Preview production build locally
