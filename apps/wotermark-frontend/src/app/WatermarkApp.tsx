'use client'

import { WatermarkProvider } from '@/shared/context'
import { WatermarkTool } from '@/widgets/watermark-tool'

/** Interactive island root: owns the watermark context for the whole tool. */
export default function WatermarkApp() {
  return (
    <WatermarkProvider>
      <WatermarkTool />
    </WatermarkProvider>
  )
}
