package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"log"
	"net/http"
	"runtime"
	"sync"

	"github.com/nfnt/resize"

	"backend/internal/image/models"
	"backend/internal/image/processor"
)

const (
	// maxImagesPerRequest caps how many images may be processed in a single request.
	maxImagesPerRequest = 100
	// maxPixels guards against decompression bombs (50 megapixels).
	maxPixels = 50_000_000
	// maxMultipartMemory is the in-memory cap for ParseMultipartForm (32MB).
	maxMultipartMemory = 32 << 20
)

// uploadedImage holds a fully-read image payload so the underlying file handle
// can be closed immediately instead of deferring closes inside a loop.
type uploadedImage struct {
	data     []byte
	filename string
}

func HandleProcessImages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("[ERROR] Method not allowed: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(maxMultipartMemory); err != nil {
		log.Printf("[ERROR] Failed to parse multipart form: %v", err)
		http.Error(w, "Failed to parse form data", http.StatusBadRequest)
		return
	}

	// Parse watermark configuration
	configStr := r.FormValue("watermarkConfig")
	if configStr == "" {
		log.Printf("[ERROR] No watermark configuration provided")
		http.Error(w, "No watermark configuration provided", http.StatusBadRequest)
		return
	}

	var config models.WatermarkConfig
	if err := json.Unmarshal([]byte(configStr), &config); err != nil {
		log.Printf("[ERROR] Failed to parse watermark configuration: %v", err)
		http.Error(w, "Invalid watermark configuration", http.StatusBadRequest)
		return
	}

	// Validate watermark configuration
	if err := validateConfig(config); err != nil {
		log.Printf("[ERROR] Invalid watermark configuration: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get watermark image
	watermarkFile, _, err := r.FormFile("watermark")
	if err != nil {
		log.Printf("[ERROR] Failed to get watermark file: %v", err)
		http.Error(w, "Failed to get watermark file", http.StatusBadRequest)
		return
	}

	watermarkImg, _, err := image.Decode(watermarkFile)
	watermarkFile.Close()
	if err != nil {
		log.Printf("[ERROR] Failed to decode watermark image: %v", err)
		http.Error(w, "Failed to decode watermark image", http.StatusBadRequest)
		return
	}

	// Decompression-bomb guard for the watermark itself.
	wb := watermarkImg.Bounds()
	if int64(wb.Dx())*int64(wb.Dy()) > maxPixels {
		log.Printf("[ERROR] Watermark image too large: %dx%d", wb.Dx(), wb.Dy())
		http.Error(w, "Watermark image too large", http.StatusBadRequest)
		return
	}

	// Read every uploaded image fully into memory, closing each file handle
	// immediately (no deferred closes piling up inside the loop).
	uploads := make([]uploadedImage, 0)
	for i := 0; ; i++ {
		file, header, err := r.FormFile(fmt.Sprintf("images[%d]", i))
		if err != nil {
			break // No more images
		}

		data, readErr := readAllAndClose(file)
		if readErr != nil {
			log.Printf("[ERROR] Failed to read image %d: %v", i, readErr)
			http.Error(w, "Failed to read uploaded image", http.StatusBadRequest)
			return
		}

		filename := ""
		if header != nil {
			filename = header.Filename
		}
		uploads = append(uploads, uploadedImage{data: data, filename: filename})

		if len(uploads) > maxImagesPerRequest {
			log.Printf("[ERROR] Too many images: more than %d", maxImagesPerRequest)
			http.Error(w, fmt.Sprintf("Too many images: maximum is %d per request", maxImagesPerRequest), http.StatusBadRequest)
			return
		}
	}

	// Pre-sized, index-aligned result slices so order is preserved.
	processedImages := make([][]byte, len(uploads))
	imageErrors := make([]interface{}, len(uploads))

	// Bounded worker pool.
	workers := runtime.NumCPU()
	if workers < 1 {
		workers = 1
	}
	if workers > len(uploads) {
		workers = len(uploads)
	}

	jobs := make(chan int)
	var wg sync.WaitGroup
	for wkr := 0; wkr < workers; wkr++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for idx := range jobs {
				data, errMsg := processOne(uploads[idx].data, watermarkImg, config)
				if errMsg != "" {
					imageErrors[idx] = errMsg
				} else {
					processedImages[idx] = data
				}
			}
		}()
	}

	for idx := range uploads {
		jobs <- idx
	}
	close(jobs)
	wg.Wait()

	log.Printf("[INFO] Successfully processed %d images with watermark", len(processedImages))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"images": processedImages,
		"errors": imageErrors,
	})
}

// processOne runs the full scale/watermark/encode pipeline for a single image.
// On success it returns the encoded bytes and an empty error string; on failure
// it returns nil and a non-empty error message.
func processOne(data []byte, watermarkImg image.Image, config models.WatermarkConfig) ([]byte, string) {
	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Sprintf("Failed to decode image: %v", err)
	}

	// Decompression-bomb guard.
	b := img.Bounds()
	if int64(b.Dx())*int64(b.Dy()) > maxPixels {
		return nil, "image too large"
	}

	// Scale image to fit within target dimensions.
	scaledImg := processor.ScaleImage(img, config.OutputWidth, config.OutputHeight)

	// Scale watermark.
	watermarkHeight := int(float64(scaledImg.Bounds().Dy()) * config.WatermarkSize / 100)
	scaledWatermark := resize.Resize(0, uint(watermarkHeight), watermarkImg, resize.Lanczos3)

	// Apply watermark.
	finalImg := processor.ApplyWatermark(scaledImg, scaledWatermark, config.WatermarkOpacity)

	// Encode the result.
	buf := new(bytes.Buffer)
	switch format {
	case "jpeg":
		err = jpeg.Encode(buf, finalImg, nil)
	case "png":
		err = png.Encode(buf, finalImg)
	default:
		err = jpeg.Encode(buf, finalImg, nil)
	}

	if err != nil {
		return nil, fmt.Sprintf("Failed to encode image: %v", err)
	}

	return buf.Bytes(), ""
}

// validateConfig enforces sane bounds on the watermark configuration.
func validateConfig(config models.WatermarkConfig) error {
	if config.OutputWidth < 1 || config.OutputWidth > 8000 {
		return fmt.Errorf("outputWidth must be between 1 and 8000")
	}
	if config.OutputHeight < 1 || config.OutputHeight > 8000 {
		return fmt.Errorf("outputHeight must be between 1 and 8000")
	}
	if config.WatermarkSize <= 0 || config.WatermarkSize > 100 {
		return fmt.Errorf("watermarkSize must be greater than 0 and at most 100")
	}
	return nil
}

// readAllAndClose reads a multipart file fully into memory and closes it.
func readAllAndClose(f interface {
	Read([]byte) (int, error)
	Close() error
}) ([]byte, error) {
	var buf bytes.Buffer
	_, err := buf.ReadFrom(f)
	closeErr := f.Close()
	if err != nil {
		return nil, err
	}
	if closeErr != nil {
		return nil, closeErr
	}
	return buf.Bytes(), nil
}
