import { css, cx } from '@shadow-panda/styled-system/css'
import { HStack } from '@shadow-panda/styled-system/jsx'
import { p } from '@shadow-panda/styled-system/recipes'

export const Footer = () => {
  return (
    <footer
      className={css({
        width: '100%',
        py: '4',
        px: '6',
        bg: 'gray.100',
        _dark: { bg: 'gray.900', borderColor: 'gray.800' },
        borderTopWidth: '1px',
        borderColor: 'gray.200',
      })}
    >
      <HStack justify="space-between" alignItems="center" maxW="7xl" mx="auto">
        <p
          className={cx(
            p(),
            css({
              fontSize: 'sm',
              color: 'gray.600',
              _dark: { color: 'gray.400' },
            }),
          )}
        >
          © {new Date().getFullYear()} Wotermark. Made by Ivan Jeržabek
        </p>
        <HStack gap="4">
          <a
            href="https://github.com/your-username/wotermark"
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              fontSize: 'sm',
              color: 'gray.600',
              _dark: { color: 'gray.400' },
              _hover: {
                color: 'gray.900',
                _dark: { color: 'gray.100' },
              },
            })}
          >
            GitHub
          </a>
          <a
            href="#"
            className={css({
              fontSize: 'sm',
              color: 'gray.600',
              _dark: { color: 'gray.400' },
              _hover: {
                color: 'gray.900',
                _dark: { color: 'gray.100' },
              },
            })}
          >
            Privacy Policy
          </a>
        </HStack>
      </HStack>
    </footer>
  )
}
