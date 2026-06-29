import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { WatermarkProvider } from '@/shared/context'

import { WatermarkConfiguration } from './WatermarkConfiguration'

const renderWithProvider = () =>
  render(
    <WatermarkProvider>
      <WatermarkConfiguration />
    </WatermarkProvider>,
  )

describe('WatermarkConfiguration', () => {
  it('renders the size and opacity controls without a11y violations', async () => {
    const { container } = renderWithProvider()

    expect(screen.getByLabelText('Width (px)')).toBeInTheDocument()
    expect(screen.getByLabelText('Height (px)')).toBeInTheDocument()
    expect(screen.getByLabelText('Size (% of image height)')).toBeInTheDocument()
    expect(screen.getByLabelText('Opacity')).toBeInTheDocument()

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('reflects and updates the opacity value', () => {
    renderWithProvider()
    const slider = screen.getByLabelText('Opacity') as HTMLInputElement

    expect(slider.value).toBe('50') // default 0.5 -> 50%

    fireEvent.change(slider, { target: { value: '80' } })
    expect(slider.value).toBe('80')
  })
})
