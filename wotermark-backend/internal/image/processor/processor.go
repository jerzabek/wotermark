package processor

import (
	"image"
	"image/color"
	"math"

	"github.com/nfnt/resize"
)

func ScaleImage(img image.Image, targetWidth, targetHeight int) image.Image {
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

func ApplyWatermark(img, watermark image.Image, watermarkOpacity float64) image.Image {
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
