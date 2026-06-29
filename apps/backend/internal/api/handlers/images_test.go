package handlers

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
)

// makePNG encodes a small solid w x h PNG.
func makePNG(t *testing.T, w, h int, c color.Color) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, c)
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("failed to encode png: %v", err)
	}
	return buf.Bytes()
}

// buildProcessRequest constructs a multipart request body for process-images.
// If config is empty, the watermarkConfig field is omitted. If includeWatermark
// is false, the watermark file is omitted. numImages controls how many image
// fields are added.
func buildProcessRequest(t *testing.T, config string, includeWatermark bool, numImages int) (*bytes.Buffer, string) {
	t.Helper()
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)

	if config != "" {
		if err := mw.WriteField("watermarkConfig", config); err != nil {
			t.Fatalf("write config field: %v", err)
		}
	}

	if includeWatermark {
		fw, err := mw.CreateFormFile("watermark", "wm.png")
		if err != nil {
			t.Fatalf("create watermark form file: %v", err)
		}
		if _, err := fw.Write(makePNG(t, 20, 20, color.RGBA{255, 0, 0, 255})); err != nil {
			t.Fatalf("write watermark: %v", err)
		}
	}

	for i := 0; i < numImages; i++ {
		fw, err := mw.CreateFormFile("images["+itoa(i)+"]", "img"+itoa(i)+".png")
		if err != nil {
			t.Fatalf("create image form file: %v", err)
		}
		if _, err := fw.Write(makePNG(t, 100, 80, color.RGBA{0, 0, 255, 255})); err != nil {
			t.Fatalf("write image: %v", err)
		}
	}

	if err := mw.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	return &body, mw.FormDataContentType()
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var b [20]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		b[i] = '-'
	}
	return string(b[i:])
}

const validConfig = `{"outputWidth":200,"outputHeight":200,"watermarkSize":30,"watermarkOpacity":0.5}`

func TestHandleProcessImagesHappyPath(t *testing.T) {
	body, contentType := buildProcessRequest(t, validConfig, true, 2)

	req := httptest.NewRequest(http.MethodPost, "/api/process-images", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()

	HandleProcessImages(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp struct {
		Images []*string `json:"images"`
		Errors []*string `json:"errors"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if len(resp.Images) != 2 {
		t.Fatalf("expected 2 images, got %d", len(resp.Images))
	}
	if len(resp.Errors) != 2 {
		t.Fatalf("expected 2 errors, got %d", len(resp.Errors))
	}
	if resp.Images[0] == nil || *resp.Images[0] == "" {
		t.Fatalf("expected image[0] to be non-null base64 data")
	}
	if resp.Errors[0] != nil {
		t.Fatalf("expected errors[0] to be null, got %v", *resp.Errors[0])
	}
}

func TestHandleProcessImagesMissingConfig(t *testing.T) {
	body, contentType := buildProcessRequest(t, "", true, 1)

	req := httptest.NewRequest(http.MethodPost, "/api/process-images", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()

	HandleProcessImages(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestHandleProcessImagesMissingWatermark(t *testing.T) {
	body, contentType := buildProcessRequest(t, validConfig, false, 1)

	req := httptest.NewRequest(http.MethodPost, "/api/process-images", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()

	HandleProcessImages(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestHandleProcessImagesWrongMethod(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/process-images", nil)
	rec := httptest.NewRecorder()

	HandleProcessImages(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", rec.Code)
	}
}

func TestHandleProcessImagesInvalidConfig(t *testing.T) {
	tests := []struct {
		name   string
		config string
	}{
		{"zero width", `{"outputWidth":0,"outputHeight":200,"watermarkSize":30,"watermarkOpacity":0.5}`},
		{"width too large", `{"outputWidth":99999,"outputHeight":200,"watermarkSize":30,"watermarkOpacity":0.5}`},
		{"zero height", `{"outputWidth":200,"outputHeight":0,"watermarkSize":30,"watermarkOpacity":0.5}`},
		{"zero watermark size", `{"outputWidth":200,"outputHeight":200,"watermarkSize":0,"watermarkOpacity":0.5}`},
		{"watermark size too large", `{"outputWidth":200,"outputHeight":200,"watermarkSize":150,"watermarkOpacity":0.5}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, contentType := buildProcessRequest(t, tt.config, true, 1)

			req := httptest.NewRequest(http.MethodPost, "/api/process-images", body)
			req.Header.Set("Content-Type", contentType)
			rec := httptest.NewRecorder()

			HandleProcessImages(rec, req)

			if rec.Code != http.StatusBadRequest {
				t.Fatalf("expected 400 for %s, got %d: %s", tt.name, rec.Code, rec.Body.String())
			}
		})
	}
}

// buildProcessRequestWithImages builds a request with a valid watermark/config
// and the exact image payloads provided, so callers can inject undecodable data.
func buildProcessRequestWithImages(t *testing.T, config string, images [][]byte) (*bytes.Buffer, string) {
	t.Helper()
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)

	if err := mw.WriteField("watermarkConfig", config); err != nil {
		t.Fatalf("write config field: %v", err)
	}

	fw, err := mw.CreateFormFile("watermark", "wm.png")
	if err != nil {
		t.Fatalf("create watermark form file: %v", err)
	}
	if _, err := fw.Write(makePNG(t, 20, 20, color.RGBA{255, 0, 0, 255})); err != nil {
		t.Fatalf("write watermark: %v", err)
	}

	for i, data := range images {
		fw, err := mw.CreateFormFile("images["+itoa(i)+"]", "img"+itoa(i)+".png")
		if err != nil {
			t.Fatalf("create image form file: %v", err)
		}
		if _, err := fw.Write(data); err != nil {
			t.Fatalf("write image %d: %v", i, err)
		}
	}

	if err := mw.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	return &body, mw.FormDataContentType()
}

// TestHandleProcessImagesPartialFailure verifies that when some images decode
// and others don't, the handler still returns 200 with index-aligned results:
// a successful slot carries base64 data (null error), while a failed slot is
// null with a non-null error message at the same index.
func TestHandleProcessImagesPartialFailure(t *testing.T) {
	valid := makePNG(t, 100, 80, color.RGBA{0, 0, 255, 255})
	garbage := []byte("this is definitely not a valid image")

	body, contentType := buildProcessRequestWithImages(t, validConfig, [][]byte{valid, garbage})

	req := httptest.NewRequest(http.MethodPost, "/api/process-images", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()

	HandleProcessImages(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp struct {
		Images []*string `json:"images"`
		Errors []*string `json:"errors"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if len(resp.Images) != 2 || len(resp.Errors) != 2 {
		t.Fatalf("expected 2 images and 2 errors, got %d/%d", len(resp.Images), len(resp.Errors))
	}

	// Index 0 succeeded.
	if resp.Images[0] == nil || *resp.Images[0] == "" {
		t.Errorf("expected image[0] to be non-null base64 data")
	}
	if resp.Errors[0] != nil {
		t.Errorf("expected errors[0] to be null, got %q", *resp.Errors[0])
	}

	// Index 1 failed.
	if resp.Images[1] != nil {
		t.Errorf("expected image[1] to be null for the undecodable input")
	}
	if resp.Errors[1] == nil || *resp.Errors[1] == "" {
		t.Errorf("expected errors[1] to carry a message for the undecodable input")
	}
}

// TestHandleProcessImagesAllFailed verifies that when every image fails to
// decode, the handler still returns 200 with all images null and every error
// populated, rather than failing the whole request.
func TestHandleProcessImagesAllFailed(t *testing.T) {
	body, contentType := buildProcessRequestWithImages(t, validConfig, [][]byte{
		[]byte("not an image"),
		[]byte("also not an image"),
	})

	req := httptest.NewRequest(http.MethodPost, "/api/process-images", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()

	HandleProcessImages(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp struct {
		Images []*string `json:"images"`
		Errors []*string `json:"errors"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if len(resp.Images) != 2 || len(resp.Errors) != 2 {
		t.Fatalf("expected 2 images and 2 errors, got %d/%d", len(resp.Images), len(resp.Errors))
	}

	for i := 0; i < 2; i++ {
		if resp.Images[i] != nil {
			t.Errorf("expected image[%d] to be null", i)
		}
		if resp.Errors[i] == nil || *resp.Errors[i] == "" {
			t.Errorf("expected errors[%d] to carry a message", i)
		}
	}
}
