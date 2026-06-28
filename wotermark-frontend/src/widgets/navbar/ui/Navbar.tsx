import { css } from '@shadow-panda/styled-system/css'
import { HStack, styled } from '@shadow-panda/styled-system/jsx'
import Link from 'next/link'

import { SITE_NAME } from '@/shared/config/site'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

const Nav = styled('nav', {
  base: {
    width: 'full',
    py: '4',
    px: '6',
    bg: 'gray.100',
    borderBottomWidth: '1px',
    borderColor: 'gray.200',
    _dark: { bg: 'gray.900', borderColor: 'gray.800' },
  },
})

const navLink = css({
  fontSize: 'sm',
  color: 'gray.600',
  textDecoration: 'none',
  _dark: { color: 'gray.400' },
  _hover: { color: 'gray.900', _dark: { color: 'gray.100' } },
})

export const Navbar = () => {
  return (
    <Nav>
      <HStack justify="space-between" alignItems="center" maxW="7xl" mx="auto">
        <Link
          href="/"
          className={css({
            fontWeight: 'bold',
            fontSize: 'xl',
            color: 'gray.900',
            textDecoration: 'none',
            _dark: { color: 'gray.100' },
          })}
        >
          {SITE_NAME}
        </Link>
        <HStack gap="6" alignItems="center">
          <Link href="/about" className={navLink}>
            About
          </Link>
          <Link href="/contact" className={navLink}>
            Contact
          </Link>
          <ThemeToggle />
        </HStack>
      </HStack>
    </Nav>
  )
}
