import { css, cx } from '@shadow-panda/styled-system/css'
import { Box, VStack } from '@shadow-panda/styled-system/jsx'
import { p } from '@shadow-panda/styled-system/recipes'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

import { Button } from '@/shared/ui'

type FileUploadProps = {
  onFilesSelected: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
}

export const FileUpload = ({ onFilesSelected, accept, maxFiles = 0 }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = maxFiles ? acceptedFiles.slice(0, maxFiles) : acceptedFiles
      onFilesSelected(newFiles)
    },
    [maxFiles, onFilesSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  })

  return (
    <VStack gap="4" w="100%">
      <Box
        position="relative"
        {...getRootProps()}
        borderWidth="2px"
        borderStyle="dashed"
        borderRadius="lg"
        px="20"
        py="16"
        w="100%"
        cursor="pointer"
        borderColor={isDragActive ? 'gray.500' : 'gray.300'}
        bg="gray.50"
        _dark={{
          bg: 'gray.900',
          borderColor: isDragActive ? 'gray.400' : 'gray.600',
        }}
        _hover={{
          borderColor: 'gray.500',
          _dark: { borderColor: 'gray.400' },
        }}
        transition="all 0.2s"
      >
        <input {...getInputProps()} />
        <VStack gap="2">
          <p className={cx(p(), css({ color: 'gray.900', textAlign: 'center', _dark: { color: 'gray.100' } }))}>
            Drop your images here, or click to select files
          </p>
          <Button variant="outline">Select Files</Button>
        </VStack>

        {isDragActive && (
          <Box
            position="absolute"
            inset="0"
            bg="slate.600"
            opacity={0.75}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
          >
            <p
              className={cx(
                p(),
                css({
                  fontWeight: 'bold',
                  color: 'white',
                }),
              )}
            >
              Drop files here
            </p>
          </Box>
        )}
      </Box>
    </VStack>
  )
}
