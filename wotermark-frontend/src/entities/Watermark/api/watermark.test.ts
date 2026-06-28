import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'

import { loadWatermark, saveWatermark } from './index'

const config = { outputWidth: 100, outputHeight: 50, watermarkSize: 20, watermarkOpacity: 0.5 }

describe('watermark persistence', () => {
  beforeEach(() => {
    // Fresh in-memory IndexedDB per test.
    globalThis.indexedDB = new IDBFactory()
  })

  it('returns null when nothing is saved', async () => {
    expect(await loadWatermark()).toBeNull()
  })

  it('saves and loads a watermark with its config', async () => {
    await loadWatermark() // ensures the object store exists, mirroring app startup
    await saveWatermark({ blob: new Blob(['x'], { type: 'image/png' }), config })

    const loaded = await loadWatermark()
    expect(loaded).not.toBeNull()
    expect(loaded?.config).toEqual(config)
  })

  it('deletes the watermark when saving null', async () => {
    await loadWatermark()
    await saveWatermark({ blob: new Blob(['x'], { type: 'image/png' }), config })
    await saveWatermark(null)

    expect(await loadWatermark()).toBeNull()
  })
})
