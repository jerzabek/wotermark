import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@shadow-panda/preset'],
  preflight: true,
  include: ['./src/**/*.{ts,tsx,js,jsx}', './app/**/*.{ts,tsx,js,jsx}'],
  jsxFramework: 'react',
  outdir: '@shadow-panda/styled-system',

  globalCss: {
    // Visible keyboard focus for every interactive element.
    '*:focus-visible': {
      outlineColor: 'wmAccent',
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineOffset: '2px',
    },
    // Respect users who prefer reduced motion.
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
    },
  },

  theme: {
    extend: {
      tokens: {
        colors: {
          wmBgLight: { value: 'hsl(81, 50%, 90%)' },
          wmBgDark: { value: 'hsl(81, 50%, 10%)' },
          wmTextLight: { value: 'hsl(81, 50%, 10%)' },
          wmTextDark: { value: 'hsl(81, 50%, 90%)' },
          wmAccentLight: { value: 'hsl(21, 80%, 20%)' },
          wmAccentDark: { value: 'hsl(21, 80%, 80%)' },
          wmSliderLight: { value: 'hsl(141, 80%, 20%)' },
          wmSliderDark: { value: 'hsl(141, 80%, 80%)' },
        },
      },
      semanticTokens: {
        colors: {
          wmBg: {
            value: {
              base: '{colors.wmBgLight}',
              _dark: '{colors.wmBgDark}',
            },
          },
          wmText: {
            value: {
              base: '{colors.wmTextLight}',
              _dark: '{colors.wmTextDark}',
            },
          },
          wmAccent: {
            value: {
              base: '{colors.wmAccentLight}',
              _dark: '{colors.wmAccentDark}',
            },
          },
          wmSlider: {
            value: {
              base: '{colors.wmSliderLight}',
              _dark: '{colors.wmSliderDark}',
            },
          },
        },
      },
    },
  },
})
