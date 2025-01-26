import { css } from '@shadow-panda/styled-system/css'
import { VStack, Box, HStack } from '@shadow-panda/styled-system/jsx'
import { useEffect, useState } from 'react'

import { FileUpload } from '@/features/FileUpload'
import { useWatermark } from '@/shared/context'
import { Input, Button, Label } from '@/shared/ui'

export const WatermarkConfiguration = () => {
  const { config, setConfig, watermarkPreview, setWatermark } = useWatermark()

  const [widthInput, setWidthInput] = useState(config.outputWidth.toString())
  const [heightInput, setHeightInput] = useState(config.outputHeight.toString())
  const [sizeInput, setSizeInput] = useState(config.watermarkSize.toString())

  useEffect(() => {
    setWidthInput(config.outputWidth.toString())
    setHeightInput(config.outputHeight.toString())
    setSizeInput(config.watermarkSize.toString())
  }, [config])

  const handleWatermarkUpload = async (files: File[]) => {
    if (files.length > 0) {
      await setWatermark(files[0])
    } else {
      await setWatermark(null)
    }
  }

  return (
    <HStack gap="4" w="100%" flexDirection={{ base: 'column', md: 'row' }}>
      <Box flex={{ base: '1', md: '2' }}>
        <Label className={css({ color: 'gray.700', _dark: { color: 'gray.300' } })}>Watermark Image</Label>
        {!watermarkPreview ? (
          <FileUpload
            onFilesSelected={handleWatermarkUpload}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            maxFiles={1}
          />
        ) : (
          <Box
            borderWidth="2px"
            borderStyle="solid"
            borderRadius="lg"
            borderColor="gray.300"
            _dark={{ borderColor: 'gray.600' }}
            overflow="hidden"
            position="relative"
          >
            <img
              src={watermarkPreview}
              alt="Watermark preview"
              className={css({
                width: '100%',
                height: '250px',
                objectFit: 'contain',
                backgroundColor: 'gray.50',
                _dark: { backgroundColor: 'gray.950' },
              })}
            />
            <Button
              position="absolute"
              top="2"
              right="2"
              size="sm"
              variant="destructive"
              onClick={() => setWatermark(null)}
            >
              Remove
            </Button>
          </Box>
        )}
      </Box>
      <VStack flex="1" w="100%">
        <Box w="100%">
          <Label htmlFor="output-width" className={css({ color: 'gray.700', _dark: { color: 'gray.300' } })}>
            Output Image Size
          </Label>

          <HStack gap="4">
            <Box flex="1">
              <Label
                htmlFor="output-width"
                className={css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })}
              >
                Width (px)
              </Label>
              <Input
                id="output-width"
                type="number"
                value={widthInput}
                onChange={e => {
                  setWidthInput(e.target.value)
                  const value = Number(e.target.value)
                  if (!isNaN(value)) {
                    setConfig({ outputWidth: value })
                  }
                }}
                max="8000"
                step="1"
                min="1"
              />
            </Box>
            <Box flex="1">
              <Label
                htmlFor="output-height"
                className={css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })}
              >
                Height (px)
              </Label>
              <Input
                id="output-height"
                type="number"
                value={heightInput}
                onChange={e => {
                  setHeightInput(e.target.value)
                  const value = Number(e.target.value)
                  if (!isNaN(value)) {
                    setConfig({ outputHeight: value })
                  }
                }}
                max="8000"
                step="1"
                min="1"
              />
            </Box>
          </HStack>
        </Box>

        <Box w="100%">
          <Label className={css({ color: 'gray.700', _dark: { color: 'gray.300' } })}>Watermark Size</Label>

          <Box w="100%">
            <Label
              htmlFor="watermark-size"
              className={css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })}
            >
              Height (% of image height)
            </Label>
            <Input
              id="watermark-size"
              type="number"
              value={sizeInput}
              onChange={e => {
                setSizeInput(e.target.value)
                const value = Number(e.target.value)
                if (!isNaN(value)) {
                  setConfig({ watermarkSize: value })
                }
              }}
              step="1"
              min="1"
              max="100"
            />
          </Box>
        </Box>
      </VStack>
    </HStack>
  )
}
