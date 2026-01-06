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

	"github.com/nfnt/resize"

	"wotermark-backend/internal/image/models"
	"wotermark-backend/internal/image/processor"
)

func HandleProcessImages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("[ERROR] Method not allowed: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(32 << 20); err != nil { // 32MB max memory
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

	// Get watermark image
	watermarkFile, _, err := r.FormFile("watermark")
	if err != nil {
		log.Printf("[ERROR] Failed to get watermark file: %v", err)
		http.Error(w, "Failed to get watermark file", http.StatusBadRequest)
		return
	}
	defer watermarkFile.Close()

	watermarkImg, _, err := image.Decode(watermarkFile)
	if err != nil {
		log.Printf("[ERROR] Failed to decode watermark image: %v", err)
		http.Error(w, "Failed to decode watermark image", http.StatusBadRequest)
		return
	}

	// Process each uploaded image
	processedImages := make([][]byte, 0)
	imageErrors := make([]interface{}, 0) // Using interface{} to allow nil values

	for i := 0; ; i++ {
		file, _, err := r.FormFile(fmt.Sprintf("images[%d]", i))
		if err != nil {
			break // No more images
		}
		defer file.Close()

		var imageError interface{} = nil
		var processedImage []byte

		// Decode the image
		img, format, err := image.Decode(file)
		if err != nil {
			log.Printf("[ERROR] Failed to decode image %d: %v", i, err)
			imageError = fmt.Sprintf("Failed to decode image: %v", err)
		} else {
			// Scale image to fit within target dimensions
			scaledImg := processor.ScaleImage(img, config.OutputWidth, config.OutputHeight)

			// Scale watermark
			watermarkHeight := int(float64(scaledImg.Bounds().Dy()) * config.WatermarkSize / 100)
			scaledWatermark := resize.Resize(0, uint(watermarkHeight), watermarkImg, resize.Lanczos3)

			// Apply watermark
			finalImg := processor.ApplyWatermark(scaledImg, scaledWatermark, config.WatermarkOpacity)

			// Encode the result
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
				log.Printf("[ERROR] Failed to encode processed image %d: %v", i, err)
				imageError = fmt.Sprintf("Failed to encode image: %v", err)
			} else {
				processedImage = buf.Bytes()
			}
		}

		processedImages = append(processedImages, processedImage)
		imageErrors = append(imageErrors, imageError)
	}

	log.Printf("[INFO] Successfully processed %d images with watermark", len(processedImages))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"images": processedImages,
		"errors": imageErrors,
	})
}
