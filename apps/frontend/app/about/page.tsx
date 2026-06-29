import { css } from '@shadow-panda/styled-system/css'
import { VStack } from '@shadow-panda/styled-system/jsx'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SITE_NAME } from '@/shared/config/site'
import { Container, Heading, Text } from '@/shared/ui'

export const metadata: Metadata = {
  title: 'About',
  description: `What ${SITE_NAME} is, how it works, and why your images stay private.`,
  alternates: { canonical: '/about' },
}

const h2 = css({ fontSize: '2xl', mt: '8', mb: '3' })
const body = css({ mb: '4', lineHeight: 'relaxed' })
const link = css({ color: 'wmAccent', textDecoration: 'underline', fontWeight: 'medium' })

export default function AboutPage() {
  return (
    <Container>
      <Heading as="h1" className={css({ fontSize: { base: '3xl', md: '4xl' }, mb: '6' })}>
        About {SITE_NAME}
      </Heading>

      <Text className={body}>
        {SITE_NAME} is a free tool for adding a watermark to many images at once. Upload a single watermark, drop in a
        batch of photos, and download every one of them watermarked — no accounts, no installs, no fuss.
      </Text>

      <Heading as="h2" className={h2}>
        How it works
      </Heading>
      <ol
        className={css({
          pl: '6',
          listStyleType: 'decimal',
          color: 'gray.700',
          _dark: { color: 'gray.300' },
          lineHeight: 'relaxed',
        })}
      >
        <li className={css({ mb: '2' })}>
          <strong>Add your watermark.</strong> Upload a PNG (transparency recommended), then set the output size, how
          large the watermark should be, and its opacity.
        </li>
        <li className={css({ mb: '2' })}>
          <strong>Drop in your images.</strong> Add as many as you like — JPG, PNG or WebP.
        </li>
        <li className={css({ mb: '2' })}>
          <strong>Process &amp; download.</strong> Each image is scaled and watermarked, then you can download them
          individually or grab everything as a single ZIP.
        </li>
      </ol>

      <Heading as="h2" className={h2}>
        Privacy by design
      </Heading>
      <Text className={body}>
        Your images are processed on the fly and are never stored on the server. Your watermark and settings are kept
        locally in your browser so they&rsquo;re ready next time — they never leave your device except when you process
        a batch. There are no analytics, tracking cookies or ads. Read the full{' '}
        <Link href="/privacy" className={link}>
          privacy policy
        </Link>
        .
      </Text>

      <Heading as="h2" className={h2}>
        Free to use
      </Heading>
      <Text className={body}>
        {SITE_NAME} is free. If you hit a snag or have an idea, please{' '}
        <Link href="/contact" className={link}>
          get in touch
        </Link>
        .
      </Text>

      <VStack alignItems="flex-start" mt="8">
        <Link href="/" className={link}>
          ← Start watermarking
        </Link>
      </VStack>
    </Container>
  )
}
