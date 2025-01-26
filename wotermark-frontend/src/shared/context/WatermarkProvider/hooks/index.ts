import { createContext, useContext } from 'react'

import { WatermarkContextType } from '../model'

export const WatermarkContext = createContext<WatermarkContextType | null>(null)

export const useWatermark = () => {
  const context = useContext(WatermarkContext)
  if (!context) {
    throw new Error('useWatermark must be used within a WatermarkProvider')
  }
  return context
}
