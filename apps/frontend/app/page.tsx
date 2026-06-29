import { css } from '@shadow-panda/styled-system/css'
import { Box, VStack } from '@shadow-panda/styled-system/jsx'
import type { Metadata } from 'next'

import WatermarkApp from '@/app/WatermarkApp'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/config/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript and a modern web browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

export default function HomePage() {
  return (
    <VStack gap="0" width="100%">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box textAlign="center" maxW="2xl" mx="auto" px="4" pt={{ base: '10', md: '16' }} pb="2">
        <h1
          className={css({
            fontSize: { base: '3xl', md: '4xl' },
            fontWeight: 'bold',
            lineHeight: 'tight',
            color: 'gray.900',
            mb: '3',
            _dark: { color: 'gray.100' },
          })}
        >
          Watermark your images in bulk
        </h1>
        <p className={css({ fontSize: { base: 'md', md: 'lg' }, color: 'gray.700', _dark: { color: 'gray.300' } })}>
          Upload a watermark, drop in as many images as you like, and download them all watermarked at
          once. Your images are processed on the fly and never stored.
        </p>
      </Box>

      <WatermarkApp />
    </VStack>
  )
}
