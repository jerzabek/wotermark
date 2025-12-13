import { css, cx } from '@shadow-panda/styled-system/css'
import { VStack, Box } from '@shadow-panda/styled-system/jsx'
import { p } from '@shadow-panda/styled-system/recipes'
import { useState } from 'react'

import { FileUpload } from '@/features/FileUpload'
import { ImageList } from '@/features/ImageList'
import { useWatermark } from '@/shared/context'
import { Button } from '@/shared/ui'
import { WatermarkConfiguration } from '@/widgets/watermark-configuration'

export const HomePage = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { config, watermarkPreview } = useWatermark()

  const handleImagesUpload = (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev]
      newImages.splice(index, 1)
      return newImages
    })
  }

  const downloadBase64Image = (base64String: string, filename: string) => {
    // Create a blob from the base64 string
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/png' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleProcessImages = async () => {
    if (!watermarkPreview) return

    try {
      setIsProcessing(true)

      const formData = new FormData()

      // Get watermark image blob from preview URL
      const watermarkBlob = await fetch(watermarkPreview).then(r => r.blob())
      formData.append('watermark', watermarkBlob)
      formData.append('watermarkConfig', JSON.stringify(config))

      uploadedImages.forEach((file, index) => {
        formData.append(`images[${index}]`, file)
      })

      const response = await fetch('/api/process-images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process images')
      }

      const result: { errors: Array<string | null>; images: Array<string | null> } = await response.json()
      console.log('Images processed:', result)

      // Download successfully processed images
      result.images.forEach((base64Image, index) => {
        if (base64Image && !result.errors[index]) {
          // Get original filename and add watermark suffix
          const originalFile = uploadedImages[index]
          const originalName = originalFile.name
          const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
          const ext = originalName.substring(originalName.lastIndexOf('.'))
          const watermarkedName = `${nameWithoutExt}_watermarked${ext}`

          downloadBase64Image(base64Image, watermarkedName)
        }
      })
    } catch (error) {
      console.error('Error processing images:', error)
      // Handle error here (e.g., show error message to user)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <VStack gap="8" w="100%" p="8">
      <Box w="100%" maxW="2xl">
        <p
          className={cx(
            p(),
            css({
              fontSize: '2xl',
              fontWeight: 'bold',
              mb: '2',
              color: 'gray.900',
              _dark: { color: 'gray.100' },
            }),
          )}
        >
          Wotermark
        </p>
        <p
          className={cx(
            p(),
            css({
              fontSize: 'md',
              color: 'gray.700',
              _dark: { color: 'gray.300' },
              mb: '8',
            }),
          )}
        >
          A simple tool to add watermarks to your images. Upload a watermark image and then select multiple images to
          apply the watermark to all of them at once.
        </p>
      </Box>

      <Box w="100%" maxW="2xl">
        <WatermarkConfiguration />
      </Box>

      <Box w="100%" maxW="2xl">
        <p
          className={cx(
            p(),
            css({
              fontSize: 'lg',
              fontWeight: 'medium',
              mb: '4',
            }),
          )}
        >
          Upload your images
        </p>
        <VStack gap="4" w="100%">
          <FileUpload onFilesSelected={handleImagesUpload} accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }} />

          <ImageList files={uploadedImages} onRemove={removeImage} />

          {uploadedImages.length > 0 && (
            <VStack gap="4" w="100%">
              <p
                className={cx(
                  p(),
                  css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    _dark: { color: 'gray.400' },
                  }),
                )}
              >
                {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} uploaded
              </p>
              <Button size="lg" w="100%" onClick={handleProcessImages} disabled={isProcessing || !watermarkPreview}>
                {isProcessing ? 'Processing...' : 'Process Images'}
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
