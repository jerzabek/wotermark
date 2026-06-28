package processor

import (
	"image"
	"image/color"
	"testing"
)

// newSolidRGBA builds a w x h image filled with the given color.
func newSolidRGBA(w, h int, c color.Color) *image.RGBA {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, c)
		}
	}
	return img
}

func TestScaleImage(t *testing.T) {
	tests := []struct {
		name             string
		srcW, srcH       int
		targetW, targetH int
	}{
		{"landscape downscale", 1000, 500, 200, 200},
		{"portrait downscale", 500, 1000, 200, 200},
		{"square downscale", 800, 800, 400, 400},
		{"upscale", 100, 50, 400, 400},
		{"non-uniform target", 1000, 1000, 300, 600},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			src := newSolidRGBA(tt.srcW, tt.srcH, color.RGBA{255, 0, 0, 255})
			scaled := ScaleImage(src, tt.targetW, tt.targetH)
			b := scaled.Bounds()
			gotW, gotH := b.Dx(), b.Dy()

			// Must fit within target bounds.
			if gotW > tt.targetW || gotH > tt.targetH {
				t.Fatalf("scaled image %dx%d exceeds target %dx%d", gotW, gotH, tt.targetW, tt.targetH)
			}

			// Aspect ratio must be preserved (within a small tolerance).
			srcRatio := float64(tt.srcW) / float64(tt.srcH)
			gotRatio := float64(gotW) / float64(gotH)
			tolerance := 0.05
			diff := srcRatio - gotRatio
			if diff < 0 {
				diff = -diff
			}
			if diff > tolerance {
				t.Fatalf("aspect ratio not preserved: src %.4f got %.4f", srcRatio, gotRatio)
			}

			// At least one dimension should hit the constraining target (within 1px).
			fillsW := abs(gotW-tt.targetW) <= 1
			fillsH := abs(gotH-tt.targetH) <= 1
			if !fillsW && !fillsH {
				t.Fatalf("scaled image %dx%d does not fill either target dimension %dx%d", gotW, gotH, tt.targetW, tt.targetH)
			}
		})
	}
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

func TestApplyWatermarkBounds(t *testing.T) {
	base := newSolidRGBA(100, 80, color.RGBA{0, 0, 255, 255})
	wm := newSolidRGBA(40, 40, color.RGBA{255, 0, 0, 255})

	result := ApplyWatermark(base, wm, 1.0)

	if result.Bounds() != base.Bounds() {
		t.Fatalf("result bounds %v differ from base bounds %v", result.Bounds(), base.Bounds())
	}
}

func TestApplyWatermarkBlends(t *testing.T) {
	// Blue base, fully-opaque red watermark.
	base := newSolidRGBA(100, 100, color.RGBA{0, 0, 255, 255})
	wm := newSolidRGBA(40, 40, color.RGBA{255, 0, 0, 255})

	result := ApplyWatermark(base, wm, 1.0)

	// Center pixel should be changed by an opaque watermark.
	cr, cg, cb, _ := result.At(50, 50).RGBA()
	br, bg, bb, _ := base.At(50, 50).RGBA()
	if cr == br && cg == bg && cb == bb {
		t.Fatalf("center pixel unchanged after applying opaque watermark: got (%d,%d,%d)", cr>>8, cg>>8, cb>>8)
	}

	// A corner pixel (outside the centered watermark) should be unchanged.
	pr, pg, pb, _ := result.At(0, 0).RGBA()
	if pr>>8 != 0 || pg>>8 != 0 || pb>>8 != 255 {
		t.Fatalf("corner pixel changed unexpectedly: got (%d,%d,%d)", pr>>8, pg>>8, pb>>8)
	}
}

func TestApplyWatermarkOpacityAffectsBlend(t *testing.T) {
	base := newSolidRGBA(100, 100, color.RGBA{0, 0, 255, 255})
	wm := newSolidRGBA(40, 40, color.RGBA{255, 0, 0, 255})

	// opacity 0 falls back to 0.5; full opacity is 1.0. The blended results
	// should differ at the center.
	fallback := ApplyWatermark(base, wm, 0)
	full := ApplyWatermark(base, wm, 1.0)

	fr, _, fb, _ := fallback.At(50, 50).RGBA()
	ur, _, ub, _ := full.At(50, 50).RGBA()

	if fr == ur && fb == ub {
		t.Fatalf("opacity did not affect blend: fallback (%d,%d) full (%d,%d)", fr>>8, fb>>8, ur>>8, ub>>8)
	}

	// At full opacity the red channel should be at/near max; at the 0.5 fallback
	// it should be roughly half. Sanity-check direction.
	if ur>>8 <= fr>>8 {
		t.Fatalf("expected fuller opacity to push red higher: fallback red %d full red %d", fr>>8, ur>>8)
	}
}
