import JSZip from 'jszip'

import { mimeFromName, watermarkedName } from '@/shared/lib/format'

export const base64ToBlob = (base64: string, type: string): Blob => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  return new Blob([byteNumbers], { type })
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Download a single watermarked image (base64) under its `_watermarked` name. */
export const downloadImage = (base64: string, originalName: string) => {
  const filename = watermarkedName(originalName)
  triggerDownload(base64ToBlob(base64, mimeFromName(originalName)), filename)
}

/** Zip every successful image (base64) client-side and download as one file. */
export const downloadAllAsZip = async (
  items: { base64: string; originalName: string }[],
  zipName = 'watermarked-images.zip',
) => {
  const zip = new JSZip()
  const usedNames = new Map<string, number>()

  for (const { base64, originalName } of items) {
    let filename = watermarkedName(originalName)
    // Avoid clobbering duplicates inside the archive.
    const seen = usedNames.get(filename) ?? 0
    if (seen > 0) {
      const dot = filename.lastIndexOf('.')
      filename = dot === -1 ? `${filename} (${seen})` : `${filename.slice(0, dot)} (${seen})${filename.slice(dot)}`
    }
    usedNames.set(watermarkedName(originalName), seen + 1)
    zip.file(filename, base64, { base64: true })
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(blob, zipName)
}
