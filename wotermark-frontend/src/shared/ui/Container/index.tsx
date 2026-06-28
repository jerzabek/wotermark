import { styled } from '@shadow-panda/styled-system/jsx'

/** Centered, readable-width page container for content pages. */
export const Container = styled('div', {
  base: {
    maxW: '3xl',
    mx: 'auto',
    px: '4',
    py: { base: '8', md: '12' },
    width: 'full',
  },
})
