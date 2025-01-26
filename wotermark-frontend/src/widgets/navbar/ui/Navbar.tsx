import { HStack } from '@shadow-panda/styled-system/jsx'
import { styled } from '@shadow-panda/styled-system/jsx'

import { ThemeToggle } from '@/shared/ui/ThemeToggle'

const Nav = styled('nav', {
  base: {
    width: 'full',
    py: '4',
    px: '6',
    bg: 'gray.100',
    _dark: {
      bg: 'gray.900',
    },
  },
})

export const Navbar = () => {
  return (
    <Nav>
      <HStack justify="space-between" alignContent="center">
        <styled.span fontWeight="bold" fontSize="xl" color="gray.900" _dark={{ color: 'gray.100' }}>
          Wotermark
        </styled.span>
        <ThemeToggle />
      </HStack>
    </Nav>
  )
}
