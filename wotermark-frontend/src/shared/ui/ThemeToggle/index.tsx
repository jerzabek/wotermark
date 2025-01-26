import { Flex } from '@shadow-panda/styled-system/jsx'
import { useEffect, useState } from 'react'

import { useTheme } from '@/shared/context'
import { Label, Switch } from '@/shared/ui'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(theme === 'dark' || (theme === 'system' && mediaQuery.matches))

    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const handleSwitch = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <Flex alignItems="center" gap="2">
      <Switch id="dark-mode" checked={isDark} onCheckedChange={handleSwitch} />
      <Label htmlFor="dark-mode">{isDark ? '🌙' : '☀️'}</Label>
    </Flex>
  )
}
