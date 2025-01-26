import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shadow-panda/styled-system': path.resolve(__dirname, './@shadow-panda/styled-system'),
    },
  },
})
