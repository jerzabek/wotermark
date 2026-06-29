package api

import (
	"net/http"

	"backend/internal/api/handlers"
)

func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/process-images", handlers.HandleProcessImages)
	mux.HandleFunc("/api/contact", handlers.HandleContact)
	mux.HandleFunc("/api/health", handlers.HandleHealth)

	return mux
}
