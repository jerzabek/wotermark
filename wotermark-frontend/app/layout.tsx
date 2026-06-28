import './globals.css'

import { css } from '@shadow-panda/styled-system/css'
import type { Metadata, Viewport } from 'next'

import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_URL } from '@/shared/config/site'
import { ServiceWorkerRegister } from '@/shared/lib/ServiceWorkerRegister'
import { Footer } from '@/widgets/footer'
import { Navbar } from '@/widgets/navbar'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Batch image watermarking`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Batch image watermarking`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: SITE_LOCALE,
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Batch image watermarking`,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
}

// Applies the saved/system theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',s==='dark'||((!s||s==='system')&&d));}catch(e){}})();`

const skipLink = css({
  position: 'absolute',
  left: '2',
  top: '2',
  zIndex: '50',
  px: '4',
  py: '2',
  borderRadius: 'md',
  bg: 'wmAccent',
  color: 'wmBg',
  fontWeight: 'medium',
  transform: 'translateY(-150%)',
  transition: 'transform 0.15s ease',
  _focus: { transform: 'translateY(0)' },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE_LOCALE} suppressHydrationWarning>
      <body
        className={css({
          display: 'flex',
          flexDirection: 'column',
          minH: '100dvh',
          bg: 'gray.50',
          color: 'gray.900',
          _dark: { bg: 'gray.950', color: 'gray.100' },
        })}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a href="#main-content" className={skipLink}>
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className={css({ flex: '1', width: 'full' })}>
          {children}
        </main>
        <Footer />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
