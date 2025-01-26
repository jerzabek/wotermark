import { css } from '@shadow-panda/styled-system/css'
import { Box, HStack } from '@shadow-panda/styled-system/jsx'
import { useEffect, useState } from 'react'

import { Button } from '@/shared/ui'

import { formatFileSize } from '../utils'

type ImageListProps = {
  files: File[]
  onRemove: (index: number) => void
}

export const ImageList = ({ files, onRemove }: ImageListProps) => {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [files])

  if (files.length === 0) return null

  return (
    <HStack justify="space-evenly" flexWrap="wrap">
      {files.map((file, index) => (
        <Box
          key={previews[index]}
          position="relative"
          borderWidth="2px"
          borderStyle="solid"
          borderRadius="lg"
          borderColor="gray.300"
          _dark={{ borderColor: 'gray.600' }}
          overflow="hidden"
          width="150px"
        >
          <Box position="relative" width="100%" height="150px">
            <img
              src={previews[index]}
              alt={file.name}
              className={css({
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              })}
            />
            <Button
              position="absolute"
              top="1"
              right="1"
              size="sm"
              variant="ghost"
              color="red.700"
              onClick={() => onRemove(index)}
              className={css({
                minWidth: 'auto',
                height: '20px',
                width: '20px',
                padding: '0',
              })}
            >
              ×
            </Button>
          </Box>
          <Box
            p="2"
            className={css({
              fontSize: 'xs',
              color: 'gray.600',
              _dark: { color: 'gray.400' },
              wordBreak: 'break-all',
            })}
          >
            <p
              className={css({
                mb: '1',
                lineHeight: 'tight',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                /** @ts-expect-error Not fully supported. */
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              })}
            >
              {file.name}
            </p>
            <p className={css({ display: 'flex', alignItems: 'center', gap: '1', opacity: 0.8 })}>
              {formatFileSize(file.size)}
              <span
                className={css({
                  display: 'inline-block',
                  width: '3px',
                  height: '3px',
                  borderRadius: 'full',
                  backgroundColor: 'currentColor',
                })}
              />
              {file.type.split('/')[1].toUpperCase()}
            </p>
          </Box>
        </Box>
      ))}
    </HStack>
  )
}
