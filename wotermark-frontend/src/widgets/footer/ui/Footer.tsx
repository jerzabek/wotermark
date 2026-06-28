import { css } from '@shadow-panda/styled-system/css'
import { HStack, styled } from '@shadow-panda/styled-system/jsx'
import { hstack } from '@shadow-panda/styled-system/patterns'
import Link from 'next/link'

import { REPO_URL, SITE_AUTHOR, SITE_NAME } from '@/shared/config/site'

const FooterRoot = styled('footer', {
  base: {
    width: 'full',
    py: '4',
    px: '6',
    bg: 'gray.100',
    borderTopWidth: '1px',
    borderColor: 'gray.200',
    _dark: { bg: 'gray.900', borderColor: 'gray.800' },
  },
})

const footerLink = css({
  fontSize: 'sm',
  color: 'gray.600',
  textDecoration: 'none',
  _dark: { color: 'gray.400' },
  _hover: { color: 'gray.900', _dark: { color: 'gray.100' } },
})

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <FooterRoot>
      <HStack justify="space-between" alignItems="center" flexWrap="wrap" gap="4" maxW="7xl" mx="auto">
        <p className={css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })}>
          © {year} {SITE_NAME}. Made by {SITE_AUTHOR}.
        </p>
        <nav aria-label="Footer" className={hstack({ gap: '4', flexWrap: 'wrap' })}>
          <Link href="/about" className={footerLink}>
            About
          </Link>
          <Link href="/privacy" className={footerLink}>
            Privacy
          </Link>
          <Link href="/contact" className={footerLink}>
            Contact
          </Link>
          {REPO_URL && (
            <a href={REPO_URL} className={footerLink} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
        </nav>
      </HStack>
    </FooterRoot>
  )
}
