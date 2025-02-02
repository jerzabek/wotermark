package api

import (
	"net/http"

	"wotermark-backend/internal/api/handlers"
)

func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/process-images", handlers.HandleProcessImages)
	mux.HandleFunc("/api/health", handlers.HandleHealth)

	return mux
}
