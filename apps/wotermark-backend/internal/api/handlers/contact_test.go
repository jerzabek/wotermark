package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
)

func TestHandleContactHappyPath(t *testing.T) {
	var called int32
	var gotPayload webhookPayload

	webhook := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&called, 1)
		body, _ := io.ReadAll(r.Body)
		if err := json.Unmarshal(body, &gotPayload); err != nil {
			t.Errorf("webhook received invalid payload: %v", err)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer webhook.Close()

	t.Setenv("CONTACT_WEBHOOK_URL", webhook.URL)

	reqBody := `{"name":"Alice","email":"alice@example.com","message":"Hello there","website":""}`
	req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	HandleContact(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if atomic.LoadInt32(&called) != 1 {
		t.Fatalf("expected webhook to be called once, got %d", called)
	}
	if gotPayload.Value1 != "Alice" || gotPayload.Value2 != "alice@example.com" || gotPayload.Value3 != "Hello there" {
		t.Fatalf("unexpected webhook payload: %+v", gotPayload)
	}

	var resp map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if resp["status"] != "success" {
		t.Fatalf("expected status success, got %v", resp)
	}
}

func TestHandleContactHoneypot(t *testing.T) {
	var called int32
	webhook := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&called, 1)
		w.WriteHeader(http.StatusOK)
	}))
	defer webhook.Close()

	t.Setenv("CONTACT_WEBHOOK_URL", webhook.URL)

	reqBody := `{"name":"Bot","email":"bot@example.com","message":"spam","website":"http://spam.example"}`
	req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	HandleContact(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if atomic.LoadInt32(&called) != 0 {
		t.Fatalf("expected webhook NOT to be called, but it was called %d times", called)
	}
}

func TestHandleContactInvalidFields(t *testing.T) {
	// Webhook should not be reached for invalid input, but set it so that the
	// 400 is clearly due to validation rather than missing config.
	webhook := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("webhook should not be called for invalid input")
		w.WriteHeader(http.StatusOK)
	}))
	defer webhook.Close()
	t.Setenv("CONTACT_WEBHOOK_URL", webhook.URL)

	tests := []struct {
		name string
		body string
	}{
		{"missing name", `{"name":"","email":"a@b.com","message":"hi","website":""}`},
		{"missing email", `{"name":"A","email":"","message":"hi","website":""}`},
		{"invalid email", `{"name":"A","email":"not-an-email","message":"hi","website":""}`},
		{"missing message", `{"name":"A","email":"a@b.com","message":"","website":""}`},
		{"malformed json", `{not json`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			HandleContact(rec, req)

			if rec.Code != http.StatusBadRequest {
				t.Fatalf("expected 400 for %s, got %d: %s", tt.name, rec.Code, rec.Body.String())
			}
		})
	}
}

func TestHandleContactUnconfigured(t *testing.T) {
	t.Setenv("CONTACT_WEBHOOK_URL", "")

	reqBody := `{"name":"Alice","email":"alice@example.com","message":"Hello","website":""}`
	req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	HandleContact(rec, req)

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if resp["error"] == "" {
		t.Fatalf("expected an error message, got %v", resp)
	}
}

func TestHandleContactWebhookFailure(t *testing.T) {
	webhook := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer webhook.Close()
	t.Setenv("CONTACT_WEBHOOK_URL", webhook.URL)

	reqBody := `{"name":"Alice","email":"alice@example.com","message":"Hello","website":""}`
	req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	HandleContact(rec, req)

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestHandleContactWrongMethod(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/contact", nil)
	rec := httptest.NewRecorder()

	HandleContact(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", rec.Code)
	}
}
