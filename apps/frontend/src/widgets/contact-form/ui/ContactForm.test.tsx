import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { ContactForm } from './ContactForm'

afterEach(() => {
  vi.unstubAllGlobals()
})

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Message'), 'Hello, this is a test message.')
}

describe('ContactForm', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ContactForm />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('submits the form and shows a success message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'success' }) })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }))
    expect(await screen.findByText(/your message has been sent/i)).toBeInTheDocument()
  })

  it('surfaces a server error to the user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Contact form is not configured' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/not configured/i)).toBeInTheDocument()
  })
})
