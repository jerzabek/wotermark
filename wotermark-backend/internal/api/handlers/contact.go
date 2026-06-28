package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

// maxContactBody caps the request body for the contact endpoint (~16KB).
const maxContactBody = 16 * 1024

// emailRegex is a basic email format check.
var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

// contactRequest is the inbound JSON payload for the contact form.
type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
	Website string `json:"website"` // honeypot
}

// webhookPayload matches the IFTTT Maker webhook format.
type webhookPayload struct {
	Value1 string `json:"value1"`
	Value2 string `json:"value2"`
	Value3 string `json:"value3"`
}

func HandleContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxContactBody)

	var req contactRequest
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&req); err != nil {
		log.Printf("[ERROR] Failed to decode contact request: %v", err)
		writeJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Honeypot: if filled, silently drop bots but report success.
	if strings.TrimSpace(req.Website) != "" {
		log.Printf("[INFO] Contact honeypot triggered; dropping submission")
		writeJSONSuccess(w)
		return
	}

	// Validate fields.
	name := strings.TrimSpace(req.Name)
	email := strings.TrimSpace(req.Email)
	message := strings.TrimSpace(req.Message)

	if len(name) < 1 || len(name) > 200 {
		writeJSONError(w, http.StatusBadRequest, "Name must be between 1 and 200 characters")
		return
	}
	if len(message) < 1 || len(message) > 5000 {
		writeJSONError(w, http.StatusBadRequest, "Message must be between 1 and 5000 characters")
		return
	}
	if email == "" || !emailRegex.MatchString(email) {
		writeJSONError(w, http.StatusBadRequest, "A valid email address is required")
		return
	}

	webhookURL := os.Getenv("CONTACT_WEBHOOK_URL")
	if webhookURL == "" {
		log.Printf("[WARN] CONTACT_WEBHOOK_URL is not set; contact form is not configured")
		writeJSONError(w, http.StatusServiceUnavailable, "Contact form is not configured")
		return
	}

	payload := webhookPayload{Value1: name, Value2: email, Value3: message}
	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal webhook payload: %v", err)
		writeJSONError(w, http.StatusBadGateway, "Failed to deliver message")
		return
	}

	httpReq, err := http.NewRequest(http.MethodPost, webhookURL, bytes.NewReader(body))
	if err != nil {
		log.Printf("[ERROR] Failed to build webhook request: %v", err)
		writeJSONError(w, http.StatusBadGateway, "Failed to deliver message")
		return
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		log.Printf("[ERROR] Failed to deliver contact webhook: %v", err)
		writeJSONError(w, http.StatusBadGateway, "Failed to deliver message")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("[ERROR] Contact webhook returned non-2xx status: %d", resp.StatusCode)
		writeJSONError(w, http.StatusBadGateway, "Failed to deliver message")
		return
	}

	writeJSONSuccess(w)
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func writeJSONSuccess(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}
