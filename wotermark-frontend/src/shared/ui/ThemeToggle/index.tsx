'use client'

import { Flex } from '@shadow-panda/styled-system/jsx'
import { useEffect, useState } from 'react'

import { Label, Switch } from '@/shared/ui'

/**
 * Self-contained dark-mode toggle. The initial theme is applied before paint by
 * ThemeScript.astro; this island only reflects and updates it. Mount with
 * `client:only="react"` so its checked state always matches the live DOM and
 * never produces a hydration mismatch against build-time HTML.
 */
export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  )

  useEffect(() => {
    // Stay in sync with the OS preference while no explicit choice is stored.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const stored = localStorage.getItem('theme')
      if (!stored || stored === 'system') setIsDark(mq.matches)
    }
    mq.addEventListener('change', onChange)
    setIsDark(document.documentElement.classList.contains('dark'))
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const handleToggle = (checked: boolean) => {
    setIsDark(checked)
    localStorage.setItem('theme', checked ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', checked)
  }

  return (
    <Flex alignItems="center" gap="2">
      <Switch
        id="dark-mode"
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />
      <Label htmlFor="dark-mode" aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </Label>
    </Flex>
  )
}
