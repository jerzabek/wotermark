import { css, cx } from '@shadow-panda/styled-system/css'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const headingClass = css({
  color: 'gray.900',
  fontWeight: 'bold',
  lineHeight: 'tight',
  _dark: { color: 'gray.100' },
})

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

type HeadingProps = ComponentPropsWithoutRef<'h2'> & {
  as?: HeadingTag
  className?: string
  children: ReactNode
}

/** Renders the chosen heading level with shared styling. Pick `as` for the
 * correct document outline; size with `className` via css(). */
export const Heading = ({ as: Tag = 'h2', className, children, ...rest }: HeadingProps) => (
  <Tag className={cx(headingClass, className)} {...rest}>
    {children}
  </Tag>
)

const textClass = css({ color: 'gray.700', _dark: { color: 'gray.300' } })

type TextTag = 'p' | 'span' | 'div'

type TextProps = ComponentPropsWithoutRef<'p'> & {
  as?: TextTag
  className?: string
  children: ReactNode
}

export const Text = ({ as: Tag = 'p', className, children, ...rest }: TextProps) => (
  <Tag className={cx(textClass, className)} {...rest}>
    {children}
  </Tag>
)
