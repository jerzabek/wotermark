import { describe, expect, it } from 'vitest'

import { formatFileSize, mimeFromName, watermarkedName } from './format'

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })
  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 kB')
  })
  it('formats megabytes', () => {
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
  })
})

describe('mimeFromName', () => {
  it('maps png', () => expect(mimeFromName('a.png')).toBe('image/png'))
  it('is case-insensitive', () => expect(mimeFromName('a.WEBP')).toBe('image/webp'))
  it('falls back to jpeg for unknown extensions', () => expect(mimeFromName('a.foo')).toBe('image/jpeg'))
  it('falls back to jpeg when there is no extension', () => expect(mimeFromName('a')).toBe('image/jpeg'))
})

describe('watermarkedName', () => {
  it('inserts the suffix before the extension', () => {
    expect(watermarkedName('photo.jpg')).toBe('photo_watermarked.jpg')
  })
  it('appends when there is no extension', () => {
    expect(watermarkedName('photo')).toBe('photo_watermarked')
  })
})
