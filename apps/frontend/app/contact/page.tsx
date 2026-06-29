import { css } from '@shadow-panda/styled-system/css'
import { Box } from '@shadow-panda/styled-system/jsx'
import type { Metadata } from 'next'

import { SITE_NAME } from '@/shared/config/site'
import { Container, Heading, Text } from '@/shared/ui'
import { ContactForm } from '@/widgets/contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch about ${SITE_NAME} — questions, bugs or ideas.`,
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <Container>
      <Heading as="h1" className={css({ fontSize: { base: '3xl', md: '4xl' }, mb: '3' })}>
        Contact
      </Heading>
      <Text className={css({ mb: '8', lineHeight: 'relaxed' })}>
        Have a question, found a bug, or have a feature idea? Send a message below and it&rsquo;ll reach me directly.
        Your email is only used to reply.
      </Text>

      <Box maxW="xl">
        <ContactForm />
      </Box>
    </Container>
  )
}
