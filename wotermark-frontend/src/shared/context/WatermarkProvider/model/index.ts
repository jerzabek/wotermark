export type WatermarkConfig = {
  outputWidth: number
  outputHeight: number
  watermarkSize: number
}

export type WatermarkContextType = {
  watermarkPreview: string | null
  config: WatermarkConfig
  setConfig: (config: Partial<WatermarkConfig>) => void
  setWatermark: (file: File | null) => Promise<void>
}
