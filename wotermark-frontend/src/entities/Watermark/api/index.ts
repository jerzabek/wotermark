import { openDB } from 'idb'

import { Watermark } from '../model'

const DB_NAME = 'wotermark'
const STORE_NAME = 'watermark'
const WATERMARK_KEY = 'current'

export const loadWatermark = async (): Promise<Watermark | null> => {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME)
      },
    })
    const watermark = await db.get(STORE_NAME, WATERMARK_KEY)
    return watermark || null
  } catch (error) {
    console.error('Failed to load watermark:', error)
    return null
  }
}

export const saveWatermark = async (watermark: Watermark | null): Promise<void> => {
  try {
    const db = await openDB(DB_NAME, 1)
    if (watermark) {
      await db.put(STORE_NAME, watermark, WATERMARK_KEY)
    } else {
      await db.delete(STORE_NAME, WATERMARK_KEY)
    }
  } catch (error) {
    console.error('Failed to save watermark:', error)
  }
}
