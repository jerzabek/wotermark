'use client'

import { css } from '@shadow-panda/styled-system/css'
import { Box, HStack, VStack } from '@shadow-panda/styled-system/jsx'
import { useEffect, useState } from 'react'

import { FileUpload } from '@/features/FileUpload'
import { useWatermark } from '@/shared/context'
import { Button, Heading, Text } from '@/shared/ui'
import { WatermarkConfiguration } from '@/widgets/watermark-configuration'
import { downloadAllAsZip, downloadImage } from '../lib/download'
import { type CardStatus, UploadedImageCard } from './UploadedImageCard'

type ProcessResult = { base64: string | null; error: string | null }

const ACCEPTED = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }

export const WatermarkTool = () => {
  const { config, watermarkPreview } = useWatermark()

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [results, setResults] = useState<ProcessResult[] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [files])

  // Any change to the image list invalidates a previous run.
  const addFiles = (incoming: File[]) => {
    setFiles(prev => [...prev, ...incoming])
    setResults(null)
    setStatus('')
    setError(null)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setResults(null)
    setStatus('')
    setError(null)
  }

  const handleProcess = async () => {
    if (!watermarkPreview || files.length === 0) return

    setIsProcessing(true)
    setError(null)
    setStatus(`Processing ${files.length} image${files.length === 1 ? '' : 's'}…`)

    try {
      const formData = new FormData()
      const watermarkBlob = await fetch(watermarkPreview).then(r => r.blob())
      formData.append('watermark', watermarkBlob)
      formData.append('watermarkConfig', JSON.stringify(config))
      files.forEach((file, index) => formData.append(`images[${index}]`, file))

      const response = await fetch('/api/process-images', { method: 'POST', body: formData })
      if (!response.ok) throw new Error(`Server responded with ${response.status}`)

      const data: { images: Array<string | null>; errors: Array<string | null> } = await response.json()
      const mapped: ProcessResult[] = files.map((_, i) => ({
        base64: data.images?.[i] ?? null,
        error: data.errors?.[i] ?? null,
      }))
      setResults(mapped)

      const ok = mapped.filter(r => r.base64 && !r.error).length
      const failed = mapped.length - ok
      setStatus(`Done — ${ok} image${ok === 1 ? '' : 's'} watermarked${failed ? `, ${failed} failed` : ''}.`)
    } catch (err) {
      console.error('Failed to process images:', err)
      setError('Something went wrong while processing your images. Please try again.')
      setStatus('Processing failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const statusFor = (index: number): CardStatus => {
    if (!results) return 'idle'
    const r = results[index]
    return r && r.base64 && !r.error ? 'done' : 'error'
  }

  const successfulIndexes = results ? results.map((r, i) => ({ r, i })).filter(({ r }) => r.base64 && !r.error) : []

  const handleDownloadAll = async () => {
    await downloadAllAsZip(
      successfulIndexes.map(({ r, i }) => ({ base64: r.base64 as string, originalName: files[i].name })),
    )
  }

  return (
    <VStack gap="8" w="100%" maxW="2xl" mx="auto" p={{ base: '4', md: '8' }}>
      <Box w="100%">
        <WatermarkConfiguration />
      </Box>

      <Box w="100%">
        <Heading as="h2" className={css({ fontSize: 'lg', fontWeight: 'medium', mb: '4' })}>
          Upload your images
        </Heading>

        <VStack gap="4" w="100%">
          <FileUpload onFilesSelected={addFiles} accept={ACCEPTED} ariaLabel="Upload images to watermark" />

          {error && (
            <Text role="alert" className={css({ color: 'red.600', fontWeight: 'medium', _dark: { color: 'red.400' } })}>
              {error}
            </Text>
          )}

          {files.length > 0 && (
            <>
              <HStack w="100%" justify="space-between" flexWrap="wrap" gap="3">
                <Text className={css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })}>
                  {files.length} image{files.length === 1 ? '' : 's'} uploaded
                </Text>
                <HStack gap="3" flexWrap="wrap">
                  {successfulIndexes.length > 0 && (
                    <Button variant="outline" onClick={handleDownloadAll}>
                      Download all (.zip)
                    </Button>
                  )}
                  <Button onClick={handleProcess} disabled={isProcessing || !watermarkPreview}>
                    {isProcessing ? 'Processing…' : 'Process images'}
                  </Button>
                </HStack>
              </HStack>

              {!watermarkPreview && (
                <Text
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.700',
                    fontWeight: 'medium',
                    _dark: { color: 'gray.300' },
                  })}
                >
                  Add a watermark image above to enable processing.
                </Text>
              )}

              <Box
                role="status"
                aria-live="polite"
                w="100%"
                className={css({ fontSize: 'sm', color: 'gray.600', minH: '1.25em', _dark: { color: 'gray.400' } })}
              >
                {status}
              </Box>

              <Box display="flex" flexWrap="wrap" gap="4" justifyContent="center" w="100%">
                {files.map((file, index) => (
                  <UploadedImageCard
                    key={`${file.name}-${file.size}-${index}`}
                    file={file}
                    preview={previews[index]}
                    status={statusFor(index)}
                    error={results?.[index]?.error}
                    onRemove={!isProcessing ? () => removeFile(index) : undefined}
                    onDownload={
                      statusFor(index) === 'done'
                        ? () => downloadImage(results![index].base64 as string, file.name)
                        : undefined
                    }
                  />
                ))}
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
