export type WatermarkConfig = {
  outputWidth: number
  outputHeight: number
  watermarkSize: number
  /** Opacity of the applied watermark, 0..1. */
  watermarkOpacity: number
}

export type WatermarkContextType = {
  watermarkPreview: string | null
  config: WatermarkConfig
  setConfig: (config: Partial<WatermarkConfig>) => void
  setWatermark: (file: File | null) => Promise<void>
}

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  outputWidth: 1920,
  outputHeight: 1080,
  watermarkSize: 20,
  watermarkOpacity: 0.5,
}
