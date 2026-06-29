import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      // text → CI logs, json-summary → PR comment diff, json → drill-down, html → local browsing.
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportsDirectory: './coverage',
      // Only our own source counts; the generated Panda styled-system and tests are noise.
      include: ['src/**'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@shadow-panda/styled-system': path.resolve(dirname, './@shadow-panda/styled-system'),
    },
  },
})
