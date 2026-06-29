package models

type WatermarkConfig struct {
	OutputWidth      int     `json:"outputWidth"`
	OutputHeight     int     `json:"outputHeight"`
	WatermarkSize    float64 `json:"watermarkSize"`
	WatermarkOpacity float64 `json:"watermarkOpacity"`
}