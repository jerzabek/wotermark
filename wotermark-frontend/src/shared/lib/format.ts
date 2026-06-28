export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Best-effort MIME type from a filename extension (for download blobs). */
export const mimeFromName = (name: string) => {
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'image/jpeg'
  }
}

/** `photo.jpg` -> `photo_watermarked.jpg` */
export const watermarkedName = (original: string) => {
  const dot = original.lastIndexOf('.')
  if (dot === -1) return `${original}_watermarked`
  return `${original.slice(0, dot)}_watermarked${original.slice(dot)}`
}
