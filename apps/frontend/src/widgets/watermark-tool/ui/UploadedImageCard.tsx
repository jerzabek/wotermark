import { css } from '@shadow-panda/styled-system/css'
import { Box } from '@shadow-panda/styled-system/jsx'

import { formatFileSize } from '@/shared/lib/format'
import { Button } from '@/shared/ui'

export type CardStatus = 'idle' | 'done' | 'error'

type UploadedImageCardProps = {
  file: File
  preview?: string
  status: CardStatus
  error?: string | null
  onRemove?: () => void
  onDownload?: () => void
}

const truncate = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

export const UploadedImageCard = ({ file, preview, status, error, onRemove, onDownload }: UploadedImageCardProps) => {
  const ext = file.type.split('/')[1]?.toUpperCase() || 'IMG'

  return (
    <Box
      width="160px"
      borderWidth="2px"
      borderStyle="solid"
      borderRadius="lg"
      borderColor={status === 'error' ? 'red.400' : 'gray.300'}
      _dark={{ borderColor: status === 'error' ? 'red.600' : 'gray.600' }}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      bg="white"
      _light={{ bg: 'white' }}
    >
      <Box position="relative" width="100%" height="150px" bg="gray.100" _dark={{ bg: 'gray.900' }}>
        {preview && (
          <img src={preview} alt={file.name} className={css({ width: '100%', height: '100%', objectFit: 'cover' })} />
        )}
        {status === 'idle' && onRemove && (
          <Button
            position="absolute"
            top="1"
            right="1"
            size="sm"
            variant="ghost"
            color="red.700"
            aria-label={`Remove ${file.name}`}
            onClick={onRemove}
            className={css({
              minWidth: 'auto',
              height: '24px',
              width: '24px',
              padding: '0',
              bg: 'white',
              _dark: { bg: 'gray.800', color: 'red.300' },
            })}
          >
            ×
          </Button>
        )}
        {status === 'done' && (
          <Box
            position="absolute"
            top="1"
            right="1"
            aria-hidden="true"
            className={css({
              bg: 'green.600',
              color: 'white',
              borderRadius: 'full',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'xs',
            })}
          >
            ✓
          </Box>
        )}
      </Box>

      <Box p="2" className={css({ fontSize: 'xs', color: 'gray.600', _dark: { color: 'gray.400' } })}>
        <p className={truncate} title={file.name}>
          {file.name}
        </p>
        <p className={css({ opacity: 0.8, mt: '0.5' })}>
          {formatFileSize(file.size)} · {ext}
        </p>
        {status === 'error' && (
          <p className={css({ color: 'red.600', fontWeight: 'medium', mt: '1', _dark: { color: 'red.400' } })}>
            {error || 'Could not process'}
          </p>
        )}
      </Box>

      {status === 'done' && onDownload && (
        <Box p="2" pt="0" mt="auto">
          <Button
            size="sm"
            variant="outline"
            w="100%"
            onClick={onDownload}
            aria-label={`Download watermarked ${file.name}`}
          >
            Download
          </Button>
        </Box>
      )}
    </Box>
  )
}
