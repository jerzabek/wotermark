'use client'

import { css } from '@shadow-panda/styled-system/css'
import { VStack, Box } from '@shadow-panda/styled-system/jsx'
import { useState, type FormEvent } from 'react'

import { Button, Input, Label, Text, Textarea } from '@/shared/ui'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const fieldLabel = css({ display: 'block', mb: '1', fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', _dark: { color: 'gray.300' } })

export const ContactForm = () => {
  const [state, setState] = useState<SubmitState>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      website: String(data.get('website') ?? ''), // honeypot
    }

    setState('submitting')
    setStatusMessage('Sending your message…')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `Server responded with ${response.status}`)
      }
      setState('success')
      setStatusMessage('')
      form.reset()
    } catch (err) {
      setState('error')
      setStatusMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Please try again later.',
      )
    }
  }

  if (state === 'success') {
    return (
      <Box
        role="status"
        borderWidth="1px"
        borderColor="green.300"
        bg="green.50"
        color="green.900"
        borderRadius="lg"
        p="6"
        _dark={{ bg: 'green.950', borderColor: 'green.800', color: 'green.100' }}
      >
        <Text as="p" className={css({ color: 'inherit', fontWeight: 'medium' })}>
          Thanks for reaching out! Your message has been sent — I&rsquo;ll get back to you soon.
        </Text>
      </Box>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <VStack gap="4" alignItems="stretch" w="100%">
        {/* Honeypot: hidden from humans, tempting to bots. */}
        <div
          aria-hidden="true"
          className={css({ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' })}
        >
          <label htmlFor="website">Leave this field empty</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <Box>
          <Label htmlFor="contact-name" className={fieldLabel}>
            Name
          </Label>
          <Input id="contact-name" name="name" required maxLength={200} autoComplete="name" w="100%" />
        </Box>

        <Box>
          <Label htmlFor="contact-email" className={fieldLabel}>
            Email
          </Label>
          <Input id="contact-email" name="email" type="email" required autoComplete="email" w="100%" />
        </Box>

        <Box>
          <Label htmlFor="contact-message" className={fieldLabel}>
            Message
          </Label>
          <Textarea id="contact-message" name="message" required rows={6} maxLength={5000} w="100%" />
        </Box>

        <Box
          role="status"
          aria-live="polite"
          className={css({
            minH: '1.25em',
            fontSize: 'sm',
            color: state === 'error' ? 'red.600' : 'gray.600',
            _dark: { color: state === 'error' ? 'red.400' : 'gray.400' },
          })}
        >
          {state === 'error' ? <span role="alert">{statusMessage}</span> : statusMessage}
        </Box>

        <Button type="submit" size="lg" disabled={state === 'submitting'}>
          {state === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>
      </VStack>
    </form>
  )
}
