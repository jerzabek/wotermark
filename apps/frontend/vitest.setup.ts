import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement these; provide minimal shims for components that use them.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList
  }
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:mock'
    URL.revokeObjectURL = () => {}
  }
}
