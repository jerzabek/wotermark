'use client'

import { css } from '@shadow-panda/styled-system/css'
import { VStack, Box, HStack } from '@shadow-panda/styled-system/jsx'
import { type ChangeEvent, useEffect, useState } from 'react'

import { FileUpload } from '@/features/FileUpload'
import { useWatermark } from '@/shared/context'
import { Input, Button, Label, Slider } from '@/shared/ui'

const fieldset = css({ border: 'none', p: '0', m: '0', w: '100%' })
const legend = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'gray.700',
  mb: '2',
  p: '0',
  _dark: { color: 'gray.300' },
})
const subLabel = css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })

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
    await setWatermark(files.length > 0 ? files[0] : null)
  }

  const handleNumberChange =
    (setLocal: (v: string) => void, key: 'outputWidth' | 'outputHeight' | 'watermarkSize') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setLocal(e.target.value)
      const value = Number(e.target.value)
      if (!isNaN(value) && value > 0) {
        setConfig({ [key]: value })
      }
    }

  return (
    <HStack gap="6" w="100%" flexDirection={{ base: 'column', md: 'row' }} alignItems="flex-start">
      <Box flex={{ base: '1', md: '2' }} w="100%">
        <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', mb: '2', _dark: { color: 'gray.300' } })}>
          Watermark image
        </p>
        {!watermarkPreview ? (
          <FileUpload
            onFilesSelected={handleWatermarkUpload}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            maxFiles={1}
            ariaLabel="Upload a watermark image"
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

      <VStack flex="1" w="100%" gap="6">
        <fieldset className={fieldset}>
          <legend className={legend}>Output image size</legend>
          <HStack gap="4">
            <Box flex="1">
              <Label htmlFor="output-width" className={subLabel}>
                Width (px)
              </Label>
              <Input
                id="output-width"
                type="number"
                value={widthInput}
                onChange={handleNumberChange(setWidthInput, 'outputWidth')}
                max="8000"
                step="1"
                min="1"
              />
            </Box>
            <Box flex="1">
              <Label htmlFor="output-height" className={subLabel}>
                Height (px)
              </Label>
              <Input
                id="output-height"
                type="number"
                value={heightInput}
                onChange={handleNumberChange(setHeightInput, 'outputHeight')}
                max="8000"
                step="1"
                min="1"
              />
            </Box>
          </HStack>
        </fieldset>

        <fieldset className={fieldset}>
          <legend className={legend}>Watermark appearance</legend>
          <VStack gap="4" w="100%">
            <Box w="100%">
              <Label htmlFor="watermark-size" className={subLabel}>
                Size (% of image height)
              </Label>
              <Input
                id="watermark-size"
                type="number"
                value={sizeInput}
                onChange={handleNumberChange(setSizeInput, 'watermarkSize')}
                step="1"
                min="1"
                max="100"
              />
            </Box>

            <Slider
              id="watermark-opacity"
              label="Opacity"
              min={1}
              max={100}
              value={Math.round(config.watermarkOpacity * 100)}
              formatValue={v => `${v}%`}
              onChange={v => setConfig({ watermarkOpacity: v / 100 })}
            />
          </VStack>
        </fieldset>
      </VStack>
    </HStack>
  )
}
