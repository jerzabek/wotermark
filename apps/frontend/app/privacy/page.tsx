import { css } from '@shadow-panda/styled-system/css'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SITE_NAME } from '@/shared/config/site'
import { Container, Heading, Text } from '@/shared/ui'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} handles your data: images are never stored, no tracking, no cookies.`,
  alternates: { canonical: '/privacy' },
}

const h2 = css({ fontSize: '2xl', mt: '8', mb: '3' })
const body = css({ mb: '4', lineHeight: 'relaxed' })
const link = css({ color: 'wmAccent', textDecoration: 'underline', fontWeight: 'medium' })
const list = css({
  pl: '6',
  listStyleType: 'disc',
  color: 'gray.700',
  _dark: { color: 'gray.300' },
  lineHeight: 'relaxed',
  mb: '4',
})

export default function PrivacyPage() {
  return (
    <Container>
      <Heading as="h1" className={css({ fontSize: { base: '3xl', md: '4xl' }, mb: '2' })}>
        Privacy Policy
      </Heading>
      <Text className={css({ fontSize: 'sm', color: 'gray.500', mb: '6', _dark: { color: 'gray.500' } })}>
        Last updated 28 June 2026
      </Text>

      <Text className={body}>
        This page explains, in plain language, what happens to your data when you use {SITE_NAME}. It is written to be
        honest and easy to understand rather than as formal legal advice.
      </Text>

      <Heading as="h2" className={h2}>
        The short version
      </Heading>
      <ul className={list}>
        <li className={css({ mb: '2' })}>We never store the images you upload.</li>
        <li className={css({ mb: '2' })}>
          We don&rsquo;t track you — no analytics, no advertising, no tracking cookies.
        </li>
        <li className={css({ mb: '2' })}>Your watermark and settings stay in your browser, on your device.</li>
      </ul>

      <Heading as="h2" className={h2}>
        Images you process
      </Heading>
      <Text className={body}>
        When you process a batch, the images and watermark you selected are sent to our server, held in memory only for
        as long as it takes to apply the watermark, and the results are sent back to you. They are not written to disk,
        logged, or retained afterwards. Once your request finishes, they&rsquo;re gone from the server.
      </Text>

      <Heading as="h2" className={h2}>
        Data stored in your browser
      </Heading>
      <Text className={body}>
        To save you re-uploading it every visit, your watermark image and its settings are stored locally in your
        browser using IndexedDB. This data stays on your device and is never sent anywhere except when you choose to
        process images. You can remove it at any time by deleting the watermark in the app or clearing this site&rsquo;s
        data in your browser.
      </Text>

      <Heading as="h2" className={h2}>
        Hosting and Cloudflare
      </Heading>
      <Text className={body}>
        The site is served through Cloudflare, which acts as a content delivery network and security layer. To deliver
        and protect the site, Cloudflare may process limited technical information such as your IP address and request
        metadata, in line with their own privacy policy. This is standard infrastructure behaviour and isn&rsquo;t used
        by us to identify or track you.
      </Text>

      <Heading as="h2" className={h2}>
        Contact form
      </Heading>
      <Text className={body}>
        If you use the{' '}
        <Link href="/contact" className={link}>
          contact form
        </Link>
        , the name, email address and message you submit are forwarded to the site owner so they can reply. Delivery is
        handled by IFTTT, which relays the message to a private email inbox; the owner&rsquo;s email address is never
        exposed publicly. Your details are used only to respond to you and aren&rsquo;t added to any mailing list.
      </Text>

      <Heading as="h2" className={h2}>
        Changes
      </Heading>
      <Text className={body}>
        If this policy changes, the &ldquo;last updated&rdquo; date above will change with it.
      </Text>

      <Heading as="h2" className={h2}>
        Questions
      </Heading>
      <Text className={body}>
        If anything here is unclear, please{' '}
        <Link href="/contact" className={link}>
          reach out
        </Link>
        .
      </Text>
    </Container>
  )
}
