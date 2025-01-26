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
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process images')
      }

      const result = await response.json()
      console.log('Images processed:', result)
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
