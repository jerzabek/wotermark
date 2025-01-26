import { useState, useEffect, ReactNode } from 'react'

import { loadWatermark, saveWatermark } from '@/entities/Watermark'

import { WatermarkContext } from '../hooks'
import { WatermarkConfig } from '../model'

type WatermarkProviderProps = {
  children: ReactNode
}

export const WatermarkProvider = ({ children }: WatermarkProviderProps) => {
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null)
  const [config, setConfigState] = useState<WatermarkConfig>({
    outputWidth: 1920,
    outputHeight: 1080,
    watermarkSize: 20,
  })

  useEffect(() => {
    const initWatermark = async () => {
      const watermark = await loadWatermark()
      if (watermark) {
        const url = URL.createObjectURL(watermark.blob)
        setWatermarkPreview(url)
        setConfigState(watermark.config)
      }
    }
    initWatermark()
  }, [])

  const setConfig = async (newConfig: Partial<WatermarkConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfigState(updatedConfig)

    if (watermarkPreview) {
      const blob = await fetch(watermarkPreview).then(r => r.blob())
      await saveWatermark({
        blob,
        config: updatedConfig,
      })
    }
  }

  const setWatermark = async (file: File | null) => {
    if (!file) {
      setWatermarkPreview(null)
      await saveWatermark(null)
      return
    }

    const url = URL.createObjectURL(file)
    setWatermarkPreview(url)
    await saveWatermark({
      blob: file,
      config,
    })
  }

  return (
    <WatermarkContext.Provider
      value={{
        watermarkPreview,
        config,
        setConfig,
        setWatermark,
      }}
    >
      {children}
    </WatermarkContext.Provider>
  )
}
