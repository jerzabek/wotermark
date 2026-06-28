import { describe, expect, it } from 'vitest'

import { base64ToBlob } from './download'

describe('base64ToBlob', () => {
  it('decodes base64 into a blob with the given type and original bytes', async () => {
    const text = 'hello world'
    const blob = base64ToBlob(btoa(text), 'image/png')

    expect(blob.type).toBe('image/png')
    expect(blob.size).toBe(text.length)
    expect(await blob.text()).toBe(text)
  })
})
