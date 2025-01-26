package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"log"
	"math"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/nfnt/resize"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	http.HandleFunc("/api/process-images", handleProcessImages)
	http.HandleFunc("/health", handleHealth)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on http://localhost:%s", port)
	
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func scaleImage(img image.Image, targetWidth, targetHeight int) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	widthRatio := float64(targetWidth) / float64(width)
	heightRatio := float64(targetHeight) / float64(height)

	ratio := math.Min(widthRatio, heightRatio)

	newWidth := uint(float64(width) * ratio)
	newHeight := uint(float64(height) * ratio)

	return resize.Resize(newWidth, newHeight, img, resize.Lanczos3)
}

func applyWatermark(img, watermark image.Image, watermarkOpacity float64) image.Image {
	if watermarkOpacity == 0 {
		watermarkOpacity = 0.5
	}

	bounds := img.Bounds()
	result := image.NewRGBA(bounds)

	// Copy the original image
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			result.Set(x, y, img.At(x, y))
		}
	}

	// Calculate watermark position (center)
	wBounds := watermark.Bounds()
	wx := (bounds.Dx() - wBounds.Dx()) / 2
	wy := (bounds.Dy() - wBounds.Dy()) / 2

	// Apply watermark with alpha blending
	for y := 0; y < wBounds.Dy(); y++ {
		for x := 0; x < wBounds.Dx(); x++ {
			if wx+x < bounds.Max.X && wy+y < bounds.Max.Y {
				r1, g1, b1, a1 := watermark.At(x, y).RGBA()
				r2, g2, b2, _ := result.At(wx+x, wy+y).RGBA()

				// Convert from 0-65535 to 0-255 range
				a1 = a1 >> 8

				// Alpha blending with configurable opacity
				alpha := (float64(a1) / 255.0) * watermarkOpacity
				r := uint8((float64(r1>>8)*alpha + float64(r2>>8)*(1-alpha)))
				g := uint8((float64(g1>>8)*alpha + float64(g2>>8)*(1-alpha)))
				b := uint8((float64(b1>>8)*alpha + float64(b2>>8)*(1-alpha)))

				result.Set(wx+x, wy+y, color.RGBA{r, g, b, 255})
			}
		}
	}

	return result
}

type WatermarkConfig struct {
	OutputWidth    int     `json:"outputWidth"`
	OutputHeight   int     `json:"outputHeight"`
	WatermarkSize  float64 `json:"watermarkSize"`
	WatermarkOpacity float64 `json:"watermarkOpacity"`
}

func handleProcessImages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("Method not allowed: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(32 << 20); err != nil { // 32MB max memory
		log.Printf("Failed to parse multipart form: %v", err)
		http.Error(w, "Failed to parse form data", http.StatusBadRequest)
		return
	}

	// Parse watermark configuration
	configStr := r.FormValue("watermarkConfig")
	if configStr == "" {
		log.Printf("No watermark configuration provided")
		http.Error(w, "No watermark configuration provided", http.StatusBadRequest)
		return
	}

	var config WatermarkConfig
	if err := json.Unmarshal([]byte(configStr), &config); err != nil {
		log.Printf("Failed to parse watermark configuration: %v", err)
		http.Error(w, "Invalid watermark configuration", http.StatusBadRequest)
		return
	}

	// Get watermark image
	watermarkFile, _, err := r.FormFile("watermark")
	if err != nil {
		log.Printf("Failed to get watermark file: %v", err)
		http.Error(w, "Failed to get watermark file", http.StatusBadRequest)
		return
	}
	defer watermarkFile.Close()

	watermarkImg, _, err := image.Decode(watermarkFile)
	if err != nil {
		log.Printf("Failed to decode watermark image: %v", err)
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
			log.Printf("Failed to decode image %d: %v", i, err)
			imageError = fmt.Sprintf("Failed to decode image: %v", err)
		} else {
			// Scale image to fit within target dimensions
			scaledImg := scaleImage(img, config.OutputWidth, config.OutputHeight)

			// Scale watermark
			watermarkHeight := int(float64(scaledImg.Bounds().Dy()) * config.WatermarkSize / 100)
			scaledWatermark := resize.Resize(0, uint(watermarkHeight), watermarkImg, resize.Lanczos3)

			// Apply watermark
			finalImg := applyWatermark(scaledImg, scaledWatermark, config.WatermarkOpacity)

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
				log.Printf("Failed to encode processed image %d: %v", i, err)
				imageError = fmt.Sprintf("Failed to encode image: %v", err)
			} else {
				processedImage = buf.Bytes()
			}
		}

		processedImages = append(processedImages, processedImage)
		imageErrors = append(imageErrors, imageError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"images": processedImages,
		"errors": imageErrors,
	})
}
